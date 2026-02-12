/**
 * ═══════════════════════════════════════════════════════════════
 * 0nMCP — Stats Module
 * ═══════════════════════════════════════════════════════════════
 * 
 * Import this anywhere to get live counts:
 * 
 *   import { getStats } from './lib/stats.js'
 *   const { tools, services, actions, triggers } = getStats()
 * 
 * Used by:
 *   - Homepage (0nmcp.com)
 *   - CLI (npx 0nmcp status)
 *   - README badges
 *   - API (/api/stats endpoint)
 *   - Package description
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let _cache = null;

/**
 * Get current stats from the generated stats.json
 * Falls back to catalog.json if stats.json doesn't exist
 */
export function getStats() {
  if (_cache) return _cache;
  
  try {
    const statsPath = resolve(__dirname, 'stats.json');
    _cache = JSON.parse(readFileSync(statsPath, 'utf-8'));
    return _cache;
  } catch {
    // Fallback: compute from catalog directly
    return computeFromCatalog();
  }
}

/**
 * Compute stats directly from catalog.json (fallback)
 */
function computeFromCatalog() {
  try {
    const catalogPath = resolve(__dirname, 'catalog.json');
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
    
    let tools = 0, actions = 0, triggers = 0;
    for (const svc of catalog.services) {
      tools += svc.tools?.length || 0;
      actions += svc.actions?.length || 0;
      triggers += svc.triggers?.length || 0;
    }
    
    _cache = {
      services: catalog.services.length,
      tools,
      actions,
      triggers,
      totalCapabilities: tools + actions + triggers,
      categories: Object.keys(catalog.categories).length,
    };
    return _cache;
  } catch {
    // Last resort: return zeros
    return { services: 0, tools: 0, actions: 0, triggers: 0, totalCapabilities: 0, categories: 0 };
  }
}

/**
 * Get the full catalog
 */
export function getCatalog() {
  const catalogPath = resolve(__dirname, 'catalog.json');
  return JSON.parse(readFileSync(catalogPath, 'utf-8'));
}

/**
 * Get service by ID
 */
export function getService(id) {
  const catalog = getCatalog();
  return catalog.services.find(s => s.id === id) || null;
}

/**
 * List all service IDs
 */
export function getServiceIds() {
  const catalog = getCatalog();
  return catalog.services.map(s => s.id);
}

/**
 * Get all tools across all services
 */
export function getAllTools() {
  const catalog = getCatalog();
  return catalog.services.flatMap(s => s.tools || []);
}

/**
 * Get formatted summary string
 */
export function getSummary() {
  const s = getStats();
  return `${s.tools} tools, ${s.services} services, ${s.actions} actions, ${s.triggers} triggers`;
}

/**
 * Clear cache (for hot-reload during dev)
 */
export function clearStatsCache() {
  _cache = null;
}

export default { getStats, getCatalog, getService, getServiceIds, getAllTools, getSummary, clearStatsCache };
