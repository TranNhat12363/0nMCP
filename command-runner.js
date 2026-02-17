/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP — Command Runner
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Executes named RUNs (command aliases) defined in the SWITCH file.
 *
 * Pipeline commands run built-in actions sequentially:
 *   verify, platforms, list, serve, connect
 *
 * Workflow commands run .0n workflow files via the WorkflowRunner.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import path from 'path';
import os from 'os';
import fs from 'fs';
import { resolveInputs, parseCommandArgs } from './commands.js';

const DOT_ON_DIR = path.join(os.homedir(), '.0n');

// Colors
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Run a command from the SWITCH file
 * @param {string} alias - The command alias
 * @param {object} def - The command definition
 * @param {string[]} rawArgs - CLI arguments after the alias
 */
export async function runCommand(alias, def, rawArgs = []) {
  const type = def.type || 'workflow';
  const { args, flags } = parseCommandArgs(rawArgs);

  console.log(`${c.bright}Running: ${c.cyan}${def.name || alias}${c.reset}`);
  if (def.description) console.log(`  ${def.description}\n`);

  const start = Date.now();

  try {
    switch (type) {
      case 'pipeline':
        await runPipeline(def, args, flags);
        break;
      case 'workflow':
        await runWorkflow(def, args, flags);
        break;
      default:
        console.log(`${c.red}Unknown command type: ${type}${c.reset}`);
        process.exit(1);
    }

    const elapsed = Date.now() - start;
    console.log(`\n${c.green}${c.bright}Done${c.reset} ${c.green}(${elapsed}ms)${c.reset}`);
  } catch (err) {
    console.log(`\n${c.red}${c.bright}Failed:${c.reset} ${c.red}${err.message}${c.reset}`);
    process.exit(1);
  }
}

/**
 * Execute a pipeline command — sequential built-in actions
 */
async function runPipeline(def, args, flags) {
  const steps = def.steps || [];

  if (steps.length === 0) {
    console.log(`${c.yellow}No steps defined in this command.${c.reset}`);
    return;
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const action = step.action;
    const stepNum = `[${i + 1}/${steps.length}]`;

    console.log(`${c.cyan}${stepNum}${c.reset} ${step.description || action}...`);

    await executePipelineAction(action, step, args, flags);

    console.log(`${c.green}  ✓${c.reset} ${action} complete\n`);
  }
}

/**
 * Execute a single pipeline action
 */
async function executePipelineAction(action, step, args, flags) {
  switch (action) {
    case 'verify': {
      const { verifyAll } = await import('./engine/validator.js');
      const connectionsDir = path.join(DOT_ON_DIR, 'connections');

      if (!fs.existsSync(connectionsDir)) {
        console.log(`  ${c.yellow}No connections found.${c.reset}`);
        return;
      }

      const files = fs.readdirSync(connectionsDir).filter(f => f.endsWith('.0n'));
      const connections = {};
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(connectionsDir, file), 'utf8'));
          if (data.$0n?.sealed) continue;
          connections[data.service] = { credentials: data.auth?.credentials || {} };
        } catch { /* skip */ }
      }

      if (Object.keys(connections).length === 0) {
        console.log(`  ${c.yellow}No unsealed connections to verify.${c.reset}`);
        return;
      }

      const { results, summary } = await verifyAll(connections);
      for (const [service, result] of Object.entries(results)) {
        const icon = result.valid ? `${c.green}  ✓` : `${c.red}  ✗`;
        const latency = result.latency_ms ? ` (${result.latency_ms}ms)` : '';
        console.log(`${icon}${c.reset} ${service}${latency}${result.error ? ` — ${result.error}` : ''}`);
      }
      console.log(`  ${summary.valid}/${summary.total} valid`);
      break;
    }

    case 'platforms': {
      const { getPlatformInfo } = await import('./engine/platforms.js');
      const info = getPlatformInfo();
      for (const p of info) {
        const status = p.installed ? `${c.green}installed${c.reset}` : `${c.blue}available${c.reset}`;
        console.log(`  ${p.installed ? '●' : '○'} ${p.name} (${status})`);
      }
      break;
    }

    case 'list': {
      const connectionsDir = path.join(DOT_ON_DIR, 'connections');
      if (!fs.existsSync(connectionsDir)) {
        console.log(`  ${c.yellow}No connections found.${c.reset}`);
        return;
      }

      const files = fs.readdirSync(connectionsDir).filter(f => f.endsWith('.0n'));
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(connectionsDir, file), 'utf8'));
          console.log(`  ${c.green}●${c.reset} ${data.$0n?.name || data.service} (${file})`);
        } catch {
          console.log(`  ${c.red}●${c.reset} ${file} (error)`);
        }
      }
      break;
    }

    case 'serve': {
      const port = step.port || flags.port || 3001;
      const host = step.host || flags.host || '0.0.0.0';
      console.log(`  Starting server on ${host}:${port}...`);
      const { startServer } = await import('./server.js');
      await startServer({ port: Number(port), host: String(host) });
      break;
    }

    default:
      console.log(`  ${c.yellow}Unknown pipeline action: ${action}${c.reset}`);
  }
}

/**
 * Execute a workflow command — runs a .0n workflow file
 */
async function runWorkflow(def, args, flags) {
  const workflowName = def.workflow;
  if (!workflowName) {
    console.log(`${c.red}No workflow specified in command definition.${c.reset}`);
    process.exit(1);
  }

  // Resolve inputs from CLI args/flags
  const inputs = def.inputs ? resolveInputs(def.inputs, args, flags) : {};

  const { ConnectionManager } = await import('./connections.js');
  const { WorkflowRunner } = await import('./workflow.js');

  const connections = new ConnectionManager();
  const runner = new WorkflowRunner(connections);

  if (Object.keys(inputs).length > 0) {
    console.log(`${c.bright}Inputs:${c.reset}`, JSON.stringify(inputs, null, 2));
    console.log('');
  }

  const result = await runner.run({ workflowPath: workflowName, inputs });

  if (result.success) {
    console.log(`${c.green}${c.bright}Workflow completed${c.reset}`);
  } else {
    console.log(`${c.red}${c.bright}Workflow failed${c.reset}`);
  }

  console.log(`  Steps: ${result.stepsSuccessful}/${result.stepsExecuted} successful`);
  console.log(`  Duration: ${result.duration}ms`);

  if (result.outputs && Object.keys(result.outputs).length > 0) {
    console.log(`\n${c.bright}Outputs:${c.reset}`);
    console.log(JSON.stringify(result.outputs, null, 2));
  }

  if (result.errors?.length > 0) {
    console.log(`\n${c.red}Errors:${c.reset}`);
    for (const err of result.errors) {
      console.log(`  ${c.red}●${c.reset} ${err.service}.${err.action}: ${err.error}`);
    }
  }

  if (!result.success) process.exit(1);
}
