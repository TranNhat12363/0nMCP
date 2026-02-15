// ============================================================
// 0nMCP -Engine: Operation Registry
// ============================================================
// Reusable action definitions referenced by workflow steps
// via "operation": "id". Wraps INTERNAL_ACTIONS from workflow.js
// for type: "internal". Service operations delegate to
// catalog-based execution.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

/**
 * Registry of reusable operations for application bundles.
 * Operations are defined once and referenced by ID in workflow steps.
 */
export class OperationRegistry {
  constructor() {
    /** @type {Map<string, object>} */
    this._ops = new Map();
    /** @type {object|null} */
    this._internalActions = null;
  }

  /**
   * Load internal actions for use by "internal" type operations.
   * @param {object} actions -INTERNAL_ACTIONS from workflow.js
   */
  setInternalActions(actions) {
    this._internalActions = actions;
  }

  /**
   * Register a single operation definition.
   * @param {string} id
   * @param {object} def -{ name, type, action, params, inputs, outputs }
   */
  register(id, def) {
    this._ops.set(id, { id, ...def });
  }

  /**
   * Register all operations from a definitions object.
   * @param {Record<string, object>} defs -{ opId: { name, type, ... }, ... }
   */
  registerAll(defs) {
    for (const [id, def] of Object.entries(defs)) {
      this.register(id, def);
    }
  }

  /**
   * Check if an operation exists.
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this._ops.has(id);
  }

  /**
   * Get an operation definition.
   * @param {string} id
   * @returns {object|undefined}
   */
  get(id) {
    return this._ops.get(id);
  }

  /**
   * List all registered operations.
   * @returns {Array<{ id: string, name: string, type: string }>}
   */
  list() {
    return [...this._ops.values()].map(op => ({
      id: op.id,
      name: op.name || op.id,
      type: op.type || "internal",
      inputs: op.inputs ? Object.keys(op.inputs) : [],
      outputs: op.outputs ? Object.keys(op.outputs) : [],
    }));
  }

  /**
   * Execute an operation by ID.
   *
   * @param {string} id -Operation ID
   * @param {object} params -Resolved parameters (after template resolution)
   * @param {object} context -{ connections?, env? } for service calls
   * @returns {Promise<object>} Operation result
   */
  async execute(id, params, context = {}) {
    const op = this._ops.get(id);
    if (!op) {
      throw new Error(`Unknown operation: ${id}. Available: ${[...this._ops.keys()].join(", ")}`);
    }

    // Merge operation's default params with step-level params
    const mergedParams = { ...(op.params || {}), ...params };

    if (op.type === "internal" || !op.type) {
      return this._executeInternal(op.action, mergedParams);
    }

    if (op.type === "service") {
      return this._executeService(op.service, op.action, mergedParams, context);
    }

    throw new Error(`Unknown operation type: ${op.type} for operation ${id}`);
  }

  /**
   * Execute an internal action.
   * @private
   */
  _executeInternal(action, params) {
    if (!this._internalActions) {
      throw new Error("Internal actions not loaded. Call setInternalActions() first.");
    }

    const handler = this._internalActions[action];
    if (!handler) {
      throw new Error(`Unknown internal action: ${action}. Available: ${Object.keys(this._internalActions).join(", ")}`);
    }

    return handler(params);
  }

  /**
   * Execute a service call via ConnectionManager.
   * @private
   */
  async _executeService(service, action, params, context) {
    if (!context.connections) {
      throw new Error(`Service operation ${service}.${action} requires connections in context.`);
    }

    const creds = context.connections.getCredentials(service);
    if (!creds) {
      throw new Error(`Service ${service} not connected.`);
    }

    // Delegate to catalog-based execution via the connection manager
    // This follows the same pattern as WorkflowRunner._executeService
    const { SERVICE_CATALOG } = await import("../catalog.js");
    const catalog = SERVICE_CATALOG[service];
    if (!catalog) {
      throw new Error(`Unknown service: ${service}`);
    }

    const endpointKeys = Object.keys(catalog.endpoints);
    const ep = catalog.endpoints[action] || catalog.endpoints[endpointKeys.find(k => k.includes(action))];
    if (!ep) {
      throw new Error(`No endpoint found for ${service}.${action}`);
    }

    let url = catalog.baseUrl + ep.path;
    const allParams = { ...creds, ...params };
    url = url.replace(/\{(\w+)\}/g, (_, key) => allParams[key] || `{${key}}`);

    const headers = catalog.authHeader(creds);
    const options = { method: ep.method, headers };

    if (ep.method !== "GET" && params) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(params);
    }

    if (ep.method === "GET" && params) {
      const flat = {};
      for (const [k, v] of Object.entries(params)) {
        if (typeof v !== "object") flat[k] = String(v);
      }
      const qs = new URLSearchParams(flat).toString();
      if (qs) url += (url.includes("?") ? "&" : "?") + qs;
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ status: response.status }));

    if (!response.ok) {
      throw new Error(`${service}.${action} failed (${response.status}): ${JSON.stringify(data)}`);
    }

    return data;
  }
}

/**
 * Validate operation definitions from an application bundle.
 *
 * @param {Record<string, object>} defs -operations section of bundle
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateOperations(defs) {
  const errors = [];

  if (!defs || typeof defs !== "object") {
    return { valid: false, errors: ["Operations must be an object"] };
  }

  for (const [id, def] of Object.entries(defs)) {
    if (!def.type && !def.action) {
      errors.push(`Operation "${id}": must have "type" or "action"`);
    }

    if (def.type === "internal" || !def.type) {
      if (!def.action) {
        errors.push(`Operation "${id}": internal operations require "action"`);
      }
    }

    if (def.type === "service") {
      if (!def.service) errors.push(`Operation "${id}": service operations require "service"`);
      if (!def.action) errors.push(`Operation "${id}": service operations require "action"`);
    }

    if (def.inputs && typeof def.inputs !== "object") {
      errors.push(`Operation "${id}": "inputs" must be an object`);
    }

    if (def.outputs && typeof def.outputs !== "object") {
      errors.push(`Operation "${id}": "outputs" must be an object`);
    }
  }

  return { valid: errors.length === 0, errors };
}
