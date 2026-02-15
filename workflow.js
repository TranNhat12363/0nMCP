// ============================================================
// 0nMCP — Workflow Runtime
// ============================================================
// Loads .0n workflow files and executes them step-by-step.
// Uses the 0n-spec template engine for variable resolution.
// ============================================================

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { SERVICE_CATALOG } from "./catalog.js";
import { logExecution, WORKFLOWS_PATH } from "./connections.js";

// ── Template resolver (loaded dynamically) ───────────────

let resolveTemplate;

/**
 * Load the template resolver from 0n-spec (optional dependency).
 * Falls back to a minimal inline resolver if not available.
 */
async function loadResolver() {
  if (resolveTemplate) return;

  try {
    const spec = await import("0n-spec");
    if (spec.resolve) {
      resolveTemplate = spec.resolve;
      return;
    }
  } catch {
    // 0n-spec not installed as dependency — try local path
  }

  try {
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const spec = require("0n-spec");
    if (spec.resolve) {
      resolveTemplate = spec.resolve;
      return;
    }
  } catch {
    // Not available via require either
  }

  // Try loading resolve.js directly from sibling 0n-spec repo (development)
  try {
    const { createRequire } = await import("module");
    const { join } = await import("path");
    const { homedir } = await import("os");
    const require = createRequire(import.meta.url);
    const specResolve = require(join(homedir(), "Github", "0n-spec", "resolve.js"));
    if (specResolve.resolve) {
      resolveTemplate = specResolve.resolve;
      return;
    }
  } catch {
    // Local 0n-spec repo not available
  }

  // Minimal inline fallback — handles basic {{ref}} but no math/conditions
  resolveTemplate = function minimalResolve(template, context) {
    if (template == null) return template;
    if (Array.isArray(template)) return template.map(item => minimalResolve(item, context));
    if (typeof template === 'object') {
      const result = {};
      for (const [k, v] of Object.entries(template)) result[k] = minimalResolve(v, context);
      return result;
    }
    if (typeof template !== 'string') return template;

    const singleMatch = template.match(/^\{\{(.+?)\}\}$/);
    if (singleMatch) return resolveRef(singleMatch[1].trim(), context);

    return template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
      const val = resolveRef(expr.trim(), context);
      return val == null ? '' : String(val);
    });
  };

  function resolveRef(ref, ctx) {
    if (ref === 'now') return new Date().toISOString();
    if (ref === 'uuid') return randomUUID();
    if (ref.startsWith('env.')) return deepGet(ctx.env || process.env, ref.slice(4));
    if (ref.startsWith('inputs.')) return deepGet(ctx.inputs, ref.slice(7));
    const val = deepGet(ctx.steps, ref);
    if (val !== undefined) return val;
    return deepGet(ctx, ref);
  }

  function deepGet(obj, path) {
    if (!obj || !path) return undefined;
    const segs = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let cur = obj;
    for (const s of segs) {
      if (cur == null) return undefined;
      cur = cur[s];
    }
    return cur;
  }
}

// ── Compute expression evaluator ─────────────────────────

/**
 * Evaluate a compute expression. Handles:
 * - Numbers: 42 → 42
 * - Simple math strings: "30 + 35 + 25" → 90
 * - Ternary patterns: "((x ? 10 : 0) + (y ? 15 : 0))" → 25
 * - Passthrough: anything else returns as-is
 */
function evaluateComputeExpression(expr) {
  if (typeof expr === 'number') return expr;
  if (typeof expr !== 'string') return expr;

  const trimmed = expr.trim();

  // Simple number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);

  // Ternary expressions: (value ? trueVal : falseVal)
  // Common in scoring: ((email ? 10 : 0) + (phone ? 15 : 0))
  const ternaryRe = /\(([^()]*?)\s*\?\s*(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)\)/g;
  if (ternaryRe.test(trimmed)) {
    ternaryRe.lastIndex = 0;
    let resolved = trimmed;
    resolved = resolved.replace(ternaryRe, (_, condition, trueVal, falseVal) => {
      const cond = condition.trim();
      // Truthy: non-empty, non-"false", non-"null", non-"undefined", non-"0"
      const isTruthy = cond && cond !== 'false' && cond !== 'null' && cond !== 'undefined' && cond !== '0' && cond !== '';
      return isTruthy ? trueVal : falseVal;
    });
    // Now try to evaluate the remaining math
    return evaluateComputeExpression(resolved);
  }

  // Simple math: "30 + 35 + 25" or "(10 + 15 + 0)"
  // Strip outer parens
  let mathStr = trimmed.replace(/^\(+|\)+$/g, '').trim();
  // Only allow numbers, operators, spaces, parens, and decimal points
  if (/^[\d\s+\-*/().]+$/.test(mathStr)) {
    try {
      // Safe evaluation using Function constructor with no scope access
      // Only processes pre-validated strings containing only math chars
      const fn = new Function(`return (${mathStr});`);
      const val = fn();
      if (typeof val === 'number' && isFinite(val)) return val;
    } catch {
      // Fall through
    }
  }

  return trimmed;
}

// ── Internal action handlers ─────────────────────────────

export const INTERNAL_ACTIONS = {
  lookup(params) {
    const { table, key, value } = params;
    if (!table || !key) return { matched: false };
    const entry = table[key];
    return entry !== undefined ? { matched: true, value: entry } : { matched: false, key, value };
  },

  set(params) {
    return { ...params };
  },

  transform(params) {
    const { value, operation, ...rest } = params;
    switch (operation) {
      case 'uppercase': return { value: String(value).toUpperCase() };
      case 'lowercase': return { value: String(value).toLowerCase() };
      case 'trim':      return { value: String(value).trim() };
      case 'round':     return { value: Math.round(Number(value)) };
      case 'floor':     return { value: Math.floor(Number(value)) };
      case 'ceil':      return { value: Math.ceil(Number(value)) };
      case 'to_number': return { value: Number(value) };
      case 'to_string': return { value: String(value) };
      case 'split':     return { value: String(value).split(rest.delimiter || ',') };
      case 'join':      return { value: Array.isArray(value) ? value.join(rest.delimiter || ',') : String(value) };
      default:          return { value };
    }
  },

  compute(params) {
    const result = { ...params };

    // ── Pattern 1: Lookup table ── { lookup: { google: 30, ... }, key: "google", default: 0 }
    if (params.lookup && params.key !== undefined) {
      const val = params.lookup[params.key];
      result.value = val !== undefined ? val : (params.default || 0);
    }

    // ── Pattern 2: Expression ── { expression: "((x ? 10 : 0) + (y ? 15 : 0))" }
    if (params.expression !== undefined) {
      result.value = evaluateComputeExpression(params.expression);
    }

    // ── Pattern 3: Grade thresholds ── { total: "30 + 35 + 25", grade_thresholds: {A:80,...}, ... }
    if (params.grade_thresholds) {
      // Evaluate total: could be a number, or a string like "30 + 35 + 25"
      const total = evaluateComputeExpression(params.total);
      result.total = total;

      // Find grade — sort thresholds descending, first one where total >= threshold wins
      const sorted = Object.entries(params.grade_thresholds).sort((a, b) => b[1] - a[1]);
      let grade = sorted[sorted.length - 1]?.[0] || 'D';
      for (const [g, threshold] of sorted) {
        if (total >= threshold) { grade = g; break; }
      }
      result.grade = grade;

      if (params.priority_map) result.priority = params.priority_map[grade] || 'UNKNOWN';
      if (params.action_map) result.action = params.action_map[grade] || '';
    }

    return result;
  },

  condition(params) {
    return { result: Boolean(params.test) };
  },

  map(params) {
    const { value, mapping } = params;
    if (!mapping) return { value };
    return { value: mapping[value] !== undefined ? mapping[value] : (mapping._default !== undefined ? mapping._default : value) };
  },
};

// ── WorkflowRunner ───────────────────────────────────────

export class WorkflowRunner {
  /**
   * @param {import("./connections.js").ConnectionManager} connections
   */
  constructor(connections) {
    this.connections = connections;
    this._resolverReady = loadResolver();
  }

  /**
   * Run a .0n workflow.
   *
   * @param {object} opts
   * @param {string} [opts.workflowPath] — Name or full path to .0n file
   * @param {object} [opts.workflow] — Inline workflow definition
   * @param {object} [opts.inputs] — Input values
   * @returns {Promise<WorkflowResult>}
   */
  async run({ workflowPath, workflow, inputs = {} }) {
    await this._resolverReady;

    const startTime = Date.now();
    const executionId = `wf_${Date.now()}_${randomUUID().slice(0, 8)}`;

    // 1. Load workflow
    const wf = workflow || this._loadWorkflow(workflowPath);
    const workflowName = wf.$0n?.name || workflowPath || 'inline';

    // 2. Validate
    if (!wf.$0n || wf.$0n.type !== 'workflow') {
      throw new Error(`Invalid workflow: $0n.type must be "workflow", got "${wf.$0n?.type}"`);
    }
    if (!wf.steps || !Array.isArray(wf.steps) || wf.steps.length === 0) {
      throw new Error('Workflow has no steps');
    }

    // Validate required inputs
    if (wf.inputs) {
      for (const [key, schema] of Object.entries(wf.inputs)) {
        if (schema.required && (inputs[key] === undefined || inputs[key] === null)) {
          throw new Error(`Missing required input: ${key}`);
        }
      }
    }

    // 3. Build context
    const context = {
      inputs,
      steps: {},
      env: this._customEnv || process.env,
    };

    // 4. Execute steps
    const stepResults = [];
    const errors = [];

    for (const step of wf.steps) {
      const stepId = step.id || `step_${stepResults.length}`;

      // Evaluate conditions
      if (step.conditions) {
        const resolvedConditions = resolveTemplate(step.conditions, context);
        const shouldRun = Array.isArray(resolvedConditions)
          ? resolvedConditions.every(Boolean)
          : Boolean(resolvedConditions);

        if (!shouldRun) {
          stepResults.push({ id: stepId, status: 'skipped', service: step.service, action: step.action });
          continue;
        }
      }

      // Resolve params
      const resolvedParams = step.params ? resolveTemplate(step.params, context) : {};

      // Execute
      let result;
      try {
        if (step.operation && this._operations) {
          const opResult = await this._operations.execute(step.operation, resolvedParams, { connections: this.connections, env: context.env });
          result = { data: opResult };
        } else if (step.service === 'internal') {
          result = await this._executeInternal(step.action, resolvedParams);
        } else {
          result = await this._executeService(step.service, step.action, resolvedParams);
        }

        // Store output in context
        context.steps[stepId] = result.data || result;

        stepResults.push({
          id: stepId,
          status: 'completed',
          service: step.service,
          action: step.action,
          data: result.data || result,
        });
      } catch (err) {
        const errorInfo = { id: stepId, service: step.service, action: step.action, error: err.message };
        errors.push(errorInfo);

        // Honor error handling strategy
        const errorStrategy = step.error_handling?.on_error || wf.error_handling?.on_error || 'stop';

        if (errorStrategy === 'retry') {
          const maxRetries = step.error_handling?.retries || 3;
          const backoff = step.error_handling?.backoff_ms || 1000;
          let retrySuccess = false;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            await new Promise(r => setTimeout(r, backoff * attempt));
            try {
              if (step.operation && this._operations) {
                const opResult = await this._operations.execute(step.operation, resolvedParams, { connections: this.connections, env: context.env });
                result = { data: opResult };
              } else if (step.service === 'internal') {
                result = await this._executeInternal(step.action, resolvedParams);
              } else {
                result = await this._executeService(step.service, step.action, resolvedParams);
              }
              context.steps[stepId] = result.data || result;
              stepResults.push({ id: stepId, status: 'completed', service: step.service, action: step.action, data: result.data || result });
              retrySuccess = true;
              errors.pop(); // Remove error since retry succeeded
              break;
            } catch {
              // Retry failed
            }
          }

          if (!retrySuccess) {
            stepResults.push({ id: stepId, status: 'failed', ...errorInfo });
            if (errorStrategy !== 'continue') break;
          }
        } else if (errorStrategy === 'continue') {
          stepResults.push({ id: stepId, status: 'failed', ...errorInfo });
          context.steps[stepId] = { error: err.message };
        } else {
          // stop (default)
          stepResults.push({ id: stepId, status: 'failed', ...errorInfo });
          break;
        }
      }
    }

    // 5. Resolve outputs
    const outputs = wf.outputs ? resolveTemplate(wf.outputs, context) : {};

    const duration = Date.now() - startTime;
    const successful = stepResults.filter(r => r.status === 'completed').length;

    // 6. Log execution
    logExecution({
      success: errors.length === 0,
      task: `workflow:${workflowName}`,
      startedAt: new Date(startTime).toISOString(),
      duration,
      steps: stepResults.map(r => ({
        service: r.service,
        endpoint: r.action,
        status: r.status,
        error: r.error || null,
      })),
      servicesUsed: [...new Set(stepResults.map(r => r.service).filter(Boolean))],
    });

    return {
      success: errors.length === 0,
      workflow: workflowName,
      executionId,
      stepsExecuted: stepResults.length,
      stepsSuccessful: successful,
      duration,
      outputs,
      steps: stepResults,
      errors,
    };
  }

  /**
   * Run a workflow with an OperationRegistry and custom environment.
   * Used by the Application Engine for executing application workflows.
   *
   * @param {object} opts
   * @param {object} opts.workflow — Inline workflow definition
   * @param {object} [opts.inputs] — Input values
   * @param {import("./engine/operations.js").OperationRegistry} [opts.operations] — Operation registry
   * @param {object} [opts.env] — Custom environment variables
   * @returns {Promise<object>}
   */
  async runWithOperations({ workflow, inputs = {}, operations, env }) {
    // Temporarily set operations and env on instance
    const prevOps = this._operations;
    const prevEnv = this._customEnv;
    this._operations = operations || null;
    this._customEnv = env || null;

    try {
      return await this.run({ workflow, inputs });
    } finally {
      this._operations = prevOps;
      this._customEnv = prevEnv;
    }
  }

  /**
   * List all .0n workflows in ~/.0n/workflows/.
   */
  listWorkflows() {
    if (!existsSync(WORKFLOWS_PATH)) return [];

    const files = readdirSync(WORKFLOWS_PATH);
    const workflows = [];

    for (const file of files) {
      if (!file.endsWith('.0n') && !file.endsWith('.0n.json')) continue;

      try {
        const filePath = join(WORKFLOWS_PATH, file);
        const data = JSON.parse(readFileSync(filePath, 'utf8'));

        if (!data.$0n || data.$0n.type !== 'workflow') continue;

        workflows.push({
          name: data.$0n.name || file.replace(/\.0n(\.json)?$/, ''),
          file,
          path: filePath,
          description: data.$0n.description || '',
          version: data.$0n.version || '1.0.0',
          steps: data.steps?.length || 0,
          trigger: data.trigger?.type || 'manual',
          inputs: data.inputs ? Object.keys(data.inputs) : [],
        });
      } catch {
        // Skip invalid files
      }
    }

    return workflows;
  }

  // ── Private methods ────────────────────────────────────

  /**
   * Load a .0n workflow file by name or path.
   */
  _loadWorkflow(nameOrPath) {
    if (!nameOrPath) throw new Error('No workflow specified');

    // Try as full path first
    if (nameOrPath.includes('/') || nameOrPath.includes('\\')) {
      if (!existsSync(nameOrPath)) {
        throw new Error(`Workflow file not found: ${nameOrPath}`);
      }
      return JSON.parse(readFileSync(nameOrPath, 'utf8'));
    }

    // Try in ~/.0n/workflows/ with various extensions
    const candidates = [
      join(WORKFLOWS_PATH, `${nameOrPath}.0n`),
      join(WORKFLOWS_PATH, `${nameOrPath}.0n.json`),
      join(WORKFLOWS_PATH, nameOrPath),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return JSON.parse(readFileSync(candidate, 'utf8'));
      }
    }

    throw new Error(`Workflow not found: ${nameOrPath}. Searched in ${WORKFLOWS_PATH}`);
  }

  /**
   * Execute an internal action (no API call).
   */
  async _executeInternal(action, params) {
    const handler = INTERNAL_ACTIONS[action];
    if (!handler) {
      throw new Error(`Unknown internal action: ${action}. Available: ${Object.keys(INTERNAL_ACTIONS).join(', ')}`);
    }
    return { data: handler(params) };
  }

  /**
   * Execute a service API call.
   */
  async _executeService(service, action, params) {
    const catalog = SERVICE_CATALOG[service];
    if (!catalog) {
      throw new Error(`Unknown service: ${service}`);
    }

    // Resolve endpoint name
    const endpointKey = this._resolveEndpoint(catalog, action);
    const ep = catalog.endpoints[endpointKey];
    if (!ep) {
      throw new Error(`No endpoint found for ${service}.${action}. Available: ${Object.keys(catalog.endpoints).join(', ')}`);
    }

    const creds = this.connections.getCredentials(service);
    if (!creds) {
      throw new Error(`Service ${service} not connected. Use connect_service first.`);
    }

    // Build URL
    let url = catalog.baseUrl + ep.path;
    const allParams = { ...creds, ...params };
    url = url.replace(/\{(\w+)\}/g, (_, key) => allParams[key] || `{${key}}`);

    // Build headers
    const headers = catalog.authHeader(creds);
    const options = { method: ep.method, headers };

    // Build body
    if (ep.method !== "GET" && params) {
      const contentType = ep.contentType || "application/json";
      if (contentType === "application/x-www-form-urlencoded") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        const flat = {};
        for (const [k, v] of Object.entries(params)) {
          if (typeof v !== "object") flat[k] = String(v);
        }
        options.body = new URLSearchParams(flat).toString();
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(params);
      }
    }

    // Query string for GET
    if (ep.method === "GET" && params) {
      const flat = {};
      for (const [k, v] of Object.entries(params)) {
        if (typeof v !== "object") flat[k] = String(v);
      }
      const qs = new URLSearchParams(flat).toString();
      if (qs) url += (url.includes("?") ? "&" : "?") + qs;
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ status: response.status, statusText: response.statusText }));

    if (!response.ok) {
      throw new Error(`${service}.${action} failed (${response.status}): ${JSON.stringify(data)}`);
    }

    return { data, status: response.status };
  }

  /**
   * Resolve a dot-notation action (e.g., "customers.search") to a catalog endpoint key.
   * Tries multiple fallback strategies.
   */
  _resolveEndpoint(catalog, action) {
    const endpoints = catalog.endpoints;

    // 1. Direct match: action === endpoint key
    if (endpoints[action]) return action;

    // 2. Dot notation: "customers.search" → "search_customers"
    if (action.includes('.')) {
      const [resource, verb] = action.split('.');
      const reversed = `${verb}_${resource}`;
      if (endpoints[reversed]) return reversed;

      // Try singular: "customers.create" → "create_customer"
      const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
      const reversedSingular = `${verb}_${singular}`;
      if (endpoints[reversedSingular]) return reversedSingular;
    }

    // 3. Underscore join: "create_customer" from "create" + "customer"
    // Try action as-is with underscores
    const underscored = action.replace(/\./g, '_');
    if (endpoints[underscored]) return underscored;

    // 4. Substring match: find any endpoint containing the action
    for (const key of Object.keys(endpoints)) {
      if (key.includes(action) || action.includes(key)) return key;
    }

    // 5. No match
    return action;
  }
}
