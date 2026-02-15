// ============================================================
// 0nMCP -Engine: Application Server
// ============================================================
// Express server that mounts custom endpoints, webhooks, and
// schedules from a .0n application bundle.
//
// Startup flow:
//   1. Decrypt connections + secrets
//   2. Create ConnectionManager + OperationRegistry + WorkflowRunner
//   3. Mount endpoints → route handler → workflow → response
//   4. Mount webhook automations with signature verification
//   5. Start schedule automations with CronScheduler
//   6. Print startup banner
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { Application } from "./application.js";
import { OperationRegistry } from "./operations.js";
import { CronScheduler } from "./scheduler.js";
import { WorkflowRunner, INTERNAL_ACTIONS } from "../workflow.js";
import { ConnectionManager } from "../connections.js";
import { RateLimiter } from "../ratelimit.js";

/**
 * Resolve template expressions in endpoint mappings.
 * Handles {{body.*}}, {{query.*}}, {{params.*}}, {{headers.*}}, {{env.*}},
 * {{payload.*}}, {{workflow.outputs.*}}, {{workflow.executionId}}
 */
function resolveMapping(mapping, context) {
  if (!mapping) return {};

  const result = {};
  for (const [key, template] of Object.entries(mapping)) {
    if (typeof template !== "string") {
      result[key] = template;
      continue;
    }

    const singleMatch = template.match(/^\{\{(.+?)\}\}$/);
    if (singleMatch) {
      result[key] = deepGet(context, singleMatch[1].trim());
      continue;
    }

    result[key] = template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
      const val = deepGet(context, expr.trim());
      return val == null ? "" : String(val);
    });
  }

  return result;
}

function deepGet(obj, path) {
  if (!obj || !path) return undefined;
  const segs = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (const s of segs) {
    if (cur == null) return undefined;
    cur = cur[s];
  }
  return cur;
}

/**
 * Application Server -runs a .0n application bundle as an HTTP server.
 */
export class ApplicationServer {
  /**
   * @param {Application} app -Loaded Application instance
   */
  constructor(app) {
    this._app = app;
    this._express = null;
    this._server = null;
    this._scheduler = new CronScheduler();
    this._rateLimiters = new Map();
    this._startedAt = null;
  }

  /**
   * Start the application server.
   *
   * @param {object} options
   * @param {number} [options.port=3000]
   * @param {string} [options.host="0.0.0.0"]
   * @returns {Promise<{ server: object, port: number }>}
   */
  async start({ port = 3000, host = "0.0.0.0" } = {}) {
    let express;
    try {
      express = (await import("express")).default;
    } catch {
      throw new Error("express is required. Install with: npm install express");
    }

    // 1. Decrypt connections + secrets
    const connections = this._app.getConnections();
    const env = this._app.getFlatEnv();

    // 2. Create ConnectionManager + OperationRegistry + WorkflowRunner
    const connManager = new ConnectionManager();
    // Inject decrypted credentials into connection manager
    for (const conn of connections) {
      connManager.connections[conn.service] = {
        serviceKey: conn.service,
        name: conn.name,
        type: "service",
        credentials: conn.credentials,
        connectedAt: new Date().toISOString(),
        environment: conn.environment,
      };
    }

    const registry = new OperationRegistry();
    registry.setInternalActions(INTERNAL_ACTIONS);
    registry.registerAll(this._app.getOperations());

    const workflowRunner = new WorkflowRunner(connManager);

    // 3. Build Express app
    const app = express();
    app.use(express.json());

    // 4. Mount endpoints
    const endpoints = this._app.getEndpoints();
    for (const [route, epDef] of Object.entries(endpoints)) {
      this._mountEndpoint(app, route, epDef, {
        workflowRunner,
        registry,
        env,
      });
    }

    // 5. Mount automations
    const automations = this._app.getAutomations();
    for (const [id, auto] of Object.entries(automations)) {
      if (auto.type === "webhook") {
        this._mountWebhook(app, id, auto, {
          workflowRunner,
          registry,
          env,
        });
      } else if (auto.type === "schedule") {
        this._mountSchedule(id, auto, {
          workflowRunner,
          registry,
          env,
        });
      }
    }

    // Default health endpoint (always available)
    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        application: this._app.getSummary(),
        uptime: Math.floor((Date.now() - this._startedAt) / 1000),
        schedules: this._scheduler.list().length,
      });
    });

    // 6. Start server
    this._express = app;
    this._startedAt = Date.now();

    return new Promise((resolve) => {
      this._server = app.listen(port, host, () => {
        this._printBanner(port, host, endpoints, automations);
        resolve({ server: this._server, port });
      });
    });
  }

  /**
   * Stop the server and all scheduled jobs.
   */
  async stop() {
    this._scheduler.stopAll();
    if (this._server) {
      return new Promise((resolve) => {
        this._server.close(() => resolve());
      });
    }
  }

  /**
   * Mount an endpoint route.
   * @private
   */
  _mountEndpoint(app, route, epDef, ctx) {
    // Parse "METHOD /path" format
    const parts = route.split(/\s+/);
    let method, path;
    if (parts.length === 2) {
      method = parts[0].toLowerCase();
      path = parts[1];
    } else {
      method = "get";
      path = route;
    }

    // Built-in handlers
    if (epDef.handler === "health") {
      app[method](path, (req, res) => {
        res.json({
          status: "ok",
          application: this._app.getSummary(),
          uptime: Math.floor((Date.now() - this._startedAt) / 1000),
        });
      });
      return;
    }

    // Workflow-based endpoint
    const handler = async (req, res) => {
      try {
        // Auth check
        if (epDef.auth && epDef.auth.type !== "none") {
          const authOk = this._checkAuth(req, epDef.auth, ctx.env);
          if (!authOk) {
            res.status(401).json({ error: "Unauthorized" });
            return;
          }
        }

        // Rate limiting
        if (epDef.rate_limit) {
          const limiterKey = `endpoint:${route}`;
          if (!this._rateLimiters.has(limiterKey)) {
            const rpm = epDef.rate_limit.requests_per_minute || 60;
            this._rateLimiters.set(limiterKey, new RateLimiter(rpm, 60000));
          }
          const limiter = this._rateLimiters.get(limiterKey);
          if (!limiter.tryAcquire()) {
            res.status(429).json({ error: "Rate limit exceeded" });
            return;
          }
        }

        // Resolve input mapping
        const mappingContext = {
          body: req.body || {},
          query: req.query || {},
          params: req.params || {},
          headers: req.headers || {},
          env: ctx.env,
        };
        const inputs = epDef.input_mapping
          ? resolveMapping(epDef.input_mapping, mappingContext)
          : req.body || {};

        // Run workflow
        const workflow = this._app.getWorkflow(epDef.workflow);
        if (!workflow) {
          res.status(500).json({ error: `Workflow "${epDef.workflow}" not found in application` });
          return;
        }

        const result = await ctx.workflowRunner.runWithOperations({
          workflow,
          inputs,
          operations: ctx.registry,
          env: ctx.env,
        });

        // Resolve output mapping
        const outputContext = {
          workflow: {
            outputs: result.outputs || {},
            executionId: result.executionId,
          },
        };
        const output = epDef.output_mapping
          ? resolveMapping(epDef.output_mapping, outputContext)
          : result.outputs;

        res.json({
          success: result.success,
          ...output,
          executionId: result.executionId,
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };

    app[method](path, handler);
  }

  /**
   * Mount a webhook automation.
   * @private
   */
  _mountWebhook(app, id, auto, ctx) {
    const webhookPath = auto.config?.path || `/hooks/${id}`;

    app.post(webhookPath, async (req, res) => {
      try {
        // Verify signature if configured
        if (auto.config?.verify && auto.config?.secret_env) {
          const secret = ctx.env[auto.config.secret_env];
          if (secret) {
            const { verifyHmac } = await import("../webhooks.js");
            const rawBody = JSON.stringify(req.body);
            const sig = req.headers["x-webhook-signature"] || req.headers["x-signature"] || "";
            const verification = verifyHmac(rawBody, sig, secret);
            if (!verification.verified) {
              res.status(401).json({ error: "Webhook signature verification failed" });
              return;
            }
          }
        }

        // Resolve input mapping
        const mappingContext = {
          payload: req.body || {},
          headers: req.headers || {},
          env: ctx.env,
        };
        const inputs = auto.input_mapping
          ? resolveMapping(auto.input_mapping, mappingContext)
          : req.body || {};

        // Run workflow
        const workflow = this._app.getWorkflow(auto.workflow);
        if (!workflow) {
          res.status(500).json({ error: `Workflow "${auto.workflow}" not found` });
          return;
        }

        const result = await ctx.workflowRunner.runWithOperations({
          workflow,
          inputs,
          operations: ctx.registry,
          env: ctx.env,
        });

        res.json({
          status: result.success ? "completed" : "failed",
          executionId: result.executionId,
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }

  /**
   * Mount a schedule automation.
   * @private
   */
  _mountSchedule(id, auto, ctx) {
    if (!auto.config?.cron) return;

    this._scheduler.schedule(id, auto.config.cron, async ({ scheduledTime }) => {
      try {
        const workflow = this._app.getWorkflow(auto.workflow);
        if (!workflow) {
          console.error(`Schedule "${id}": workflow "${auto.workflow}" not found`);
          return;
        }

        const inputs = auto.input_mapping
          ? resolveMapping(auto.input_mapping, {
              env: ctx.env,
              schedule: { time: scheduledTime.toISOString(), id },
            })
          : {};

        await ctx.workflowRunner.runWithOperations({
          workflow,
          inputs,
          operations: ctx.registry,
          env: ctx.env,
        });
      } catch (err) {
        console.error(`Schedule "${id}" execution error:`, err.message);
      }
    }, { timezone: auto.config.timezone });
  }

  /**
   * Check authentication for an endpoint request.
   * @private
   */
  _checkAuth(req, authDef, env) {
    if (!authDef || authDef.type === "none") return true;

    if (authDef.type === "api_key") {
      const headerName = authDef.header || "X-API-Key";
      const expectedKey = env[authDef.key_env] || authDef.key;
      if (!expectedKey) return true; // No key configured = skip auth
      return req.headers[headerName.toLowerCase()] === expectedKey;
    }

    if (authDef.type === "bearer") {
      const expectedToken = env[authDef.token_env] || authDef.token;
      if (!expectedToken) return true;
      const authHeader = req.headers.authorization || "";
      return authHeader === `Bearer ${expectedToken}`;
    }

    return true;
  }

  /**
   * Print startup banner.
   * @private
   */
  _printBanner(port, host, endpoints, automations) {
    const c = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      cyan: "\x1b[36m",
    };

    const summary = this._app.getSummary();
    const schedules = this._scheduler.list();

    console.log(`
${c.cyan}${c.bright}
  ┌─────────────────────────────────────────────────┐
  │          0nMCP Application Server                │
  ├─────────────────────────────────────────────────┤
  │                                                  │
  │  App:     ${summary.name.padEnd(38)}│
  │  Version: ${summary.version.padEnd(38)}│
  │                                                  │
  │  URL:     http://${host}:${port}${" ".repeat(Math.max(0, 28 - host.length - String(port).length))}│
  │  Health:  http://${host}:${port}/health${" ".repeat(Math.max(0, 21 - host.length - String(port).length))}│
  │                                                  │
  │  Connections:  ${String(summary.connections).padEnd(33)}│
  │  Workflows:    ${String(summary.workflows).padEnd(33)}│
  │  Operations:   ${String(summary.operations).padEnd(33)}│
  │  Endpoints:    ${String(summary.endpoints).padEnd(33)}│
  │  Automations:  ${String(summary.automations).padEnd(33)}│
  └─────────────────────────────────────────────────┘
${c.reset}`);

    // List endpoints
    if (Object.keys(endpoints).length > 0) {
      console.log(`${c.bright}Endpoints:${c.reset}`);
      for (const route of Object.keys(endpoints)) {
        console.log(`  ${c.green}▸${c.reset} ${route}`);
      }
      console.log();
    }

    // List automations
    const webhooks = Object.entries(automations).filter(([, a]) => a.type === "webhook");
    if (webhooks.length > 0) {
      console.log(`${c.bright}Webhooks:${c.reset}`);
      for (const [id, auto] of webhooks) {
        console.log(`  ${c.yellow}▸${c.reset} ${auto.config?.path || `/hooks/${id}`} → ${auto.workflow}`);
      }
      console.log();
    }

    if (schedules.length > 0) {
      console.log(`${c.bright}Schedules:${c.reset}`);
      for (const job of schedules) {
        console.log(`  ${c.cyan}▸${c.reset} ${job.id}: ${job.expr} (next: ${job.nextRun.toISOString()})`);
      }
      console.log();
    }
  }
}
