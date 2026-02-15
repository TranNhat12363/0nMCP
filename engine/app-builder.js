// ============================================================
// 0nMCP -Engine: Application Builder
// ============================================================
// Creates, opens, inspects, and validates .0n application
// bundles ($0n.type: "application"). Analogous to bundler.js
// but for the full Application Engine format.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename } from "path";
import { createHash } from "crypto";
import { homedir } from "os";
import { sealPortable, unsealPortable } from "./cipher-portable.js";
import { validateOperations } from "./operations.js";

const APPS_DIR = join(homedir(), ".0n", "apps");

/**
 * Compute SHA-256 checksum of a string.
 */
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Create a .0n application bundle.
 *
 * @param {object} options
 * @param {string} options.name -Application name
 * @param {string} options.passphrase -Encryption passphrase
 * @param {Record<string, object>} [options.connections] -{ service: { credentials, authType?, ... } }
 * @param {Record<string, object>} [options.operations] -Operation definitions
 * @param {Record<string, object>} [options.workflows] -Workflow definitions
 * @param {Record<string, object>} [options.endpoints] -Endpoint definitions
 * @param {Record<string, object>} [options.automations] -Automation definitions
 * @param {object} [options.environment] -{ variables, secrets, settings, feature_flags }
 * @param {string} [options.output] -Output file path
 * @param {string} [options.description]
 * @param {string} [options.author]
 * @param {string} [options.version]
 * @returns {{ bundle: object, path: string, manifest: object }}
 */
export function createApplication(options) {
  const {
    name = "0n Application",
    passphrase,
    connections = {},
    operations = {},
    workflows = {},
    endpoints = {},
    automations = {},
    environment = {},
    output,
    description = "",
    author = "",
    version = "1.0.0",
  } = options;

  if (!passphrase) {
    throw new Error("Passphrase is required to create an application bundle.");
  }

  const now = new Date().toISOString();

  // Seal connections
  const bundleConnections = [];
  for (const [service, conn] of Object.entries(connections)) {
    const credJson = JSON.stringify(conn.credentials || conn);
    const { sealed } = sealPortable(credJson, passphrase);

    bundleConnections.push({
      service,
      name: conn.name || service,
      environment: conn.environment || "production",
      auth_type: conn.authType || conn.auth_type || "api_key",
      credential_keys: Object.keys(conn.credentials || conn),
      sealed: true,
      vault: {
        data: sealed,
        algorithm: "aes-256-gcm",
        kdf: "pbkdf2-sha512-100k",
        portable: true,
      },
    });
  }

  // Seal environment secrets
  const bundleEnvironment = {
    variables: environment.variables || {},
    secrets: {},
    settings: environment.settings || {},
    feature_flags: environment.feature_flags || {},
  };

  if (environment.secrets) {
    for (const [key, val] of Object.entries(environment.secrets)) {
      const { sealed } = sealPortable(String(val), passphrase);
      bundleEnvironment.secrets[key] = sealed;
    }
  }

  // Build manifest
  const manifest = {
    bundle_version: "1.0.0",
    generator: "0nmcp-engine/1.7.0",
    type: "application",
    connection_count: bundleConnections.length,
    workflow_count: Object.keys(workflows).length,
    operation_count: Object.keys(operations).length,
    endpoint_count: Object.keys(endpoints).length,
    automation_count: Object.keys(automations).length,
    services: bundleConnections.map(c => c.service),
    encryption: {
      method: "portable",
      algorithm: "aes-256-gcm",
      kdf: "pbkdf2-sha512-100k",
    },
  };

  // Assemble bundle
  const bundle = {
    $0n: {
      type: "application",
      version,
      name,
      description,
      author,
      created: now,
      updated: now,
    },
    connections: bundleConnections,
    environment: bundleEnvironment,
    operations,
    workflows,
    endpoints,
    automations,
    platforms: {},
    includes: [],
    manifest,
  };

  // Compute checksums
  manifest.checksums = {
    connections: `sha256:${sha256(JSON.stringify(bundleConnections))}`,
    operations: `sha256:${sha256(JSON.stringify(operations))}`,
    workflows: `sha256:${sha256(JSON.stringify(workflows))}`,
    endpoints: `sha256:${sha256(JSON.stringify(endpoints))}`,
    automations: `sha256:${sha256(JSON.stringify(automations))}`,
  };

  // Write to file
  if (!existsSync(APPS_DIR)) mkdirSync(APPS_DIR, { recursive: true });
  const ts = now.replace(/[:.]/g, "-").slice(0, 19);
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  const outPath = output || join(APPS_DIR, `${safeName}-${ts}.0n`);
  const outDir = join(outPath, "..");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeFileSync(outPath, JSON.stringify(bundle, null, 2));

  return { bundle, path: outPath, manifest };
}

/**
 * Open a .0n application bundle and return parsed data.
 *
 * @param {string} bundlePath -Path to .0n application file
 * @param {string} passphrase -Decryption passphrase
 * @returns {object} Parsed and decrypted bundle
 */
export function openApplication(bundlePath, passphrase) {
  const raw = readFileSync(bundlePath, "utf-8");
  const bundle = JSON.parse(raw);

  if (!bundle.$0n || bundle.$0n.type !== "application") {
    throw new Error(`Not a .0n application file. Type: ${bundle.$0n?.type || "unknown"}`);
  }

  // Verify connections can be decrypted
  for (const conn of bundle.connections || []) {
    if (conn.sealed && conn.vault?.data) {
      try {
        unsealPortable(conn.vault.data, passphrase);
      } catch {
        throw new Error(`Failed to decrypt connection "${conn.service}" -wrong passphrase.`);
      }
    }
  }

  return bundle;
}

/**
 * Inspect an application bundle without passphrase.
 *
 * @param {string} bundlePath
 * @returns {object} Application metadata
 */
export function inspectApplication(bundlePath) {
  const raw = readFileSync(bundlePath, "utf-8");
  const bundle = JSON.parse(raw);

  if (!bundle.$0n || bundle.$0n.type !== "application") {
    throw new Error(`Not a .0n application file. Type: ${bundle.$0n?.type || "unknown"}`);
  }

  return {
    name: bundle.$0n.name,
    version: bundle.$0n.version,
    description: bundle.$0n.description,
    author: bundle.$0n.author,
    created: bundle.$0n.created,
    updated: bundle.$0n.updated,
    connections: (bundle.connections || []).map(c => ({
      service: c.service,
      name: c.name,
      sealed: c.sealed,
      credential_keys: c.credential_keys,
    })),
    workflows: Object.keys(bundle.workflows || {}),
    operations: Object.keys(bundle.operations || {}),
    endpoints: Object.keys(bundle.endpoints || {}),
    automations: Object.keys(bundle.automations || {}),
    environment: {
      variables: Object.keys(bundle.environment?.variables || {}),
      secrets: Object.keys(bundle.environment?.secrets || {}),
      settings: bundle.environment?.settings || {},
      feature_flags: bundle.environment?.feature_flags || {},
    },
    manifest: bundle.manifest,
  };
}

/**
 * Validate an application bundle's cross-references.
 * Ensures endpoints reference valid workflows, workflows reference valid operations, etc.
 *
 * @param {object} bundle -Parsed application bundle
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateApplication(bundle) {
  const errors = [];
  const warnings = [];

  if (!bundle.$0n || bundle.$0n.type !== "application") {
    return { valid: false, errors: ["Not a valid .0n application bundle."], warnings };
  }

  const workflows = bundle.workflows || {};
  const operations = bundle.operations || {};
  const endpoints = bundle.endpoints || {};
  const automations = bundle.automations || {};

  // Validate operations
  if (Object.keys(operations).length > 0) {
    const opValidation = validateOperations(operations);
    errors.push(...opValidation.errors);
  }

  // Validate endpoints → workflows
  for (const [route, ep] of Object.entries(endpoints)) {
    if (ep.handler) continue; // Built-in handler (e.g., "health")

    if (ep.workflow && !workflows[ep.workflow]) {
      errors.push(`Endpoint "${route}" references unknown workflow: "${ep.workflow}"`);
    }
  }

  // Validate automations → workflows
  for (const [id, auto] of Object.entries(automations)) {
    if (auto.workflow && !workflows[auto.workflow]) {
      errors.push(`Automation "${id}" references unknown workflow: "${auto.workflow}"`);
    }

    if (auto.type === "schedule" && auto.config?.cron) {
      // Validate cron expression (import synchronously -already loaded)
      try {
        const parts = auto.config.cron.trim().split(/\s+/);
        if (parts.length !== 5) {
          errors.push(`Automation "${id}" has invalid cron: must have 5 fields`);
        }
      } catch (err) {
        errors.push(`Automation "${id}" has invalid cron: ${err.message}`);
      }
    }
  }

  // Validate workflow steps → operations
  for (const [wfId, wf] of Object.entries(workflows)) {
    if (!wf.steps || !Array.isArray(wf.steps)) {
      errors.push(`Workflow "${wfId}" has no steps array`);
      continue;
    }

    for (const step of wf.steps) {
      if (step.operation && !operations[step.operation]) {
        errors.push(`Workflow "${wfId}" step "${step.id}" references unknown operation: "${step.operation}"`);
      }
    }
  }

  // Warnings for unused operations
  const usedOps = new Set();
  for (const wf of Object.values(workflows)) {
    for (const step of wf.steps || []) {
      if (step.operation) usedOps.add(step.operation);
    }
  }
  for (const opId of Object.keys(operations)) {
    if (!usedOps.has(opId)) {
      warnings.push(`Operation "${opId}" is defined but never referenced by any workflow`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
