/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP — Named Runs / Command Aliases
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Loads command aliases from the SWITCH file (~/.0n/0n-setup.0n) and makes
 * them available as CLI commands: `0nmcp launch`, `0nmcp hello`, etc.
 *
 * Command types:
 *   - pipeline: Sequential built-in actions (verify, platforms, list, serve)
 *   - workflow: Run a named .0n workflow from ~/.0n/workflows/
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DOT_ON_DIR = join(homedir(), '.0n');
const DEFAULT_SWITCH = join(DOT_ON_DIR, '0n-setup.0n');

/**
 * Load commands from a SWITCH file
 * @param {string} [switchPath] - Path to SWITCH file. Defaults to ~/.0n/0n-setup.0n
 * @returns {Map<string, object>} Map of alias → command definition
 */
export function loadCommands(switchPath) {
  const filePath = switchPath || DEFAULT_SWITCH;
  if (!existsSync(filePath)) return new Map();

  try {
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (!data.commands || typeof data.commands !== 'object') return new Map();
    return new Map(Object.entries(data.commands));
  } catch {
    return new Map();
  }
}

/**
 * List all available commands with metadata
 * @param {string} [switchPath]
 * @returns {Array<{alias: string, name: string, description: string, type: string}>}
 */
export function listCommands(switchPath) {
  const commands = loadCommands(switchPath);
  return [...commands.entries()].map(([alias, def]) => ({
    alias,
    name: def.name || alias,
    description: def.description || '',
    type: def.type || 'workflow',
  }));
}

/**
 * Parse CLI arguments into positional args and named flags
 * @param {string[]} rawArgs - Arguments after the command name
 * @returns {{ args: string[], flags: Record<string, string> }}
 */
export function parseCommandArgs(rawArgs) {
  const args = [];
  const flags = {};

  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i].startsWith('--') && rawArgs[i + 1] && !rawArgs[i + 1].startsWith('--')) {
      flags[rawArgs[i].slice(2)] = rawArgs[i + 1];
      i++;
    } else if (rawArgs[i].startsWith('--')) {
      flags[rawArgs[i].slice(2)] = 'true';
    } else {
      args.push(rawArgs[i]);
    }
  }

  return { args, flags };
}

/**
 * Resolve template expressions in command inputs
 * Supports {{args.N}}, {{flags.key}}, and literal values
 * @param {Record<string, string>} inputs - Input template map
 * @param {string[]} args - Positional CLI args
 * @param {Record<string, string>} flags - Named CLI flags
 * @returns {Record<string, unknown>}
 */
export function resolveInputs(inputs, args, flags) {
  const resolved = {};

  for (const [key, template] of Object.entries(inputs)) {
    if (typeof template !== 'string') {
      resolved[key] = template;
      continue;
    }

    const argsMatch = template.match(/^\{\{args\.(\d+)\}\}$/);
    if (argsMatch) {
      const idx = parseInt(argsMatch[1]);
      resolved[key] = args[idx] ?? template;
      continue;
    }

    const flagsMatch = template.match(/^\{\{flags\.(\w+)\}\}$/);
    if (flagsMatch) {
      resolved[key] = flags[flagsMatch[1]] ?? template;
      continue;
    }

    // Pass through literal values
    resolved[key] = template;
  }

  return resolved;
}
