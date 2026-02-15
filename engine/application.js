// ============================================================
// 0nMCP -Engine: Application Runtime
// ============================================================
// Runtime representation of a loaded .0n application.
// Provides accessor methods for all application sections.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { unsealPortable } from "./cipher-portable.js";

/**
 * Runtime representation of a loaded .0n application bundle.
 */
export class Application {
  /**
   * @param {object} bundle -Parsed application bundle JSON
   * @param {object} [options]
   * @param {string} [options.passphrase] -Passphrase for decryption
   */
  constructor(bundle, options = {}) {
    if (!bundle.$0n || bundle.$0n.type !== "application") {
      throw new Error(`Invalid application bundle: $0n.type must be "application", got "${bundle.$0n?.type}"`);
    }

    this._bundle = bundle;
    this._passphrase = options.passphrase || null;
    this._decryptedConnections = null;
    this._decryptedSecrets = null;
    this._startedAt = new Date();
  }

  /** Application metadata */
  get name() { return this._bundle.$0n.name || "Unnamed Application"; }
  get version() { return this._bundle.$0n.version || "1.0.0"; }
  get description() { return this._bundle.$0n.description || ""; }
  get author() { return this._bundle.$0n.author || ""; }
  get created() { return this._bundle.$0n.created; }
  get updated() { return this._bundle.$0n.updated; }

  /**
   * Get decrypted connections.
   * @returns {Array<{ service: string, credentials: object }>}
   */
  getConnections() {
    if (this._decryptedConnections) return this._decryptedConnections;

    const connections = [];
    for (const conn of this._bundle.connections || []) {
      let credentials;

      if (conn.sealed && conn.vault?.data) {
        if (!this._passphrase) {
          throw new Error(`Connection ${conn.service} is sealed -passphrase required.`);
        }
        const decrypted = unsealPortable(conn.vault.data, this._passphrase);
        credentials = JSON.parse(decrypted);
      } else if (conn.credentials) {
        credentials = conn.credentials;
      } else {
        continue;
      }

      connections.push({
        service: conn.service,
        name: conn.name || conn.service,
        auth_type: conn.auth_type || "api_key",
        environment: conn.environment || "production",
        credentials,
      });
    }

    this._decryptedConnections = connections;
    return connections;
  }

  /**
   * Get a workflow definition by ID.
   * @param {string} id
   * @returns {object|undefined}
   */
  getWorkflow(id) {
    const workflows = this._bundle.workflows || {};
    return workflows[id];
  }

  /**
   * Get all workflow definitions.
   * @returns {Record<string, object>}
   */
  getWorkflows() {
    return this._bundle.workflows || {};
  }

  /**
   * Get all operation definitions.
   * @returns {Record<string, object>}
   */
  getOperations() {
    return this._bundle.operations || {};
  }

  /**
   * Get all endpoint definitions.
   * @returns {Record<string, object>}
   */
  getEndpoints() {
    return this._bundle.endpoints || {};
  }

  /**
   * Get all automation definitions.
   * @returns {Record<string, object>}
   */
  getAutomations() {
    return this._bundle.automations || {};
  }

  /**
   * Get environment configuration with secrets decrypted.
   * @returns {{ variables: object, secrets: object, settings: object, feature_flags: object }}
   */
  getEnv() {
    const env = this._bundle.environment || {};
    const result = {
      variables: { ...env.variables },
      secrets: {},
      settings: { ...env.settings },
      feature_flags: { ...env.feature_flags },
    };

    // Decrypt secrets
    if (env.secrets) {
      for (const [key, val] of Object.entries(env.secrets)) {
        if (typeof val === "string" && val.length > 50 && this._passphrase) {
          // Looks like sealed data -try to decrypt
          try {
            result.secrets[key] = unsealPortable(val, this._passphrase);
          } catch {
            result.secrets[key] = val; // Keep as-is if decryption fails
          }
        } else {
          result.secrets[key] = val;
        }
      }
    }

    return result;
  }

  /**
   * Get a flat environment object for template resolution.
   * Combines variables + decrypted secrets.
   * @returns {object}
   */
  getFlatEnv() {
    const env = this.getEnv();
    return {
      ...env.variables,
      ...env.secrets,
      ...env.settings,
      ...env.feature_flags,
    };
  }

  /**
   * Get platform configurations.
   * @returns {Record<string, object>}
   */
  getPlatforms() {
    return this._bundle.platforms || {};
  }

  /**
   * Get the manifest.
   * @returns {object}
   */
  getManifest() {
    return this._bundle.manifest || {};
  }

  /**
   * Get application summary for display.
   * @returns {object}
   */
  getSummary() {
    const endpoints = this.getEndpoints();
    const automations = this.getAutomations();
    const workflows = this.getWorkflows();
    const operations = this.getOperations();

    return {
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      connections: (this._bundle.connections || []).length,
      workflows: Object.keys(workflows).length,
      operations: Object.keys(operations).length,
      endpoints: Object.keys(endpoints).length,
      automations: Object.keys(automations).length,
      uptime: Math.floor((Date.now() - this._startedAt.getTime()) / 1000),
    };
  }
}
