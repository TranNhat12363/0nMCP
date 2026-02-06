/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP - Rate Limiter
 * ═══════════════════════════════════════════════════════════════════════════
 * Token bucket rate limiting with retry support
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Simple token bucket rate limiter
 */
export class RateLimiter {
  /**
   * @param {number} tokensPerInterval - Number of requests allowed per interval
   * @param {number} intervalMs - Interval in milliseconds
   */
  constructor(tokensPerInterval = 10, intervalMs = 1000) {
    this.tokensPerInterval = tokensPerInterval;
    this.intervalMs = intervalMs;
    this.tokens = tokensPerInterval;
    this.lastRefill = Date.now();
  }
  
  /**
   * Refill tokens based on elapsed time
   */
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.intervalMs) * this.tokensPerInterval;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokensPerInterval, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
  
  /**
   * Try to acquire a token
   * @returns {boolean} - Whether token was acquired
   */
  tryAcquire() {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
  
  /**
   * Wait for a token to become available
   * @returns {Promise<void>}
   */
  async acquire() {
    while (!this.tryAcquire()) {
      await new Promise(resolve => setTimeout(resolve, this.intervalMs / this.tokensPerInterval));
    }
  }
  
  /**
   * Get time until next token is available
   * @returns {number} - Milliseconds until next token
   */
  getWaitTime() {
    this.refill();
    if (this.tokens > 0) return 0;
    return this.intervalMs / this.tokensPerInterval;
  }
}

// Service-specific rate limiters
const SERVICE_LIMITS = {
  stripe: { requests: 100, interval: 1000 },      // 100 req/sec
  slack: { requests: 1, interval: 1000 },          // 1 req/sec (Tier 1)
  discord: { requests: 50, interval: 1000 },       // 50 req/sec
  twilio: { requests: 100, interval: 1000 },       // 100 req/sec
  sendgrid: { requests: 10, interval: 1000 },      // 10 req/sec
  openai: { requests: 60, interval: 60000 },       // 60 req/min (GPT-4)
  anthropic: { requests: 60, interval: 60000 },    // 60 req/min
  airtable: { requests: 5, interval: 1000 },       // 5 req/sec
  notion: { requests: 3, interval: 1000 },         // 3 req/sec
  supabase: { requests: 100, interval: 1000 },     // Varies
  github: { requests: 5000, interval: 3600000 },   // 5000/hour authenticated
  linear: { requests: 60, interval: 60000 },       // 60 req/min
  shopify: { requests: 2, interval: 1000 },        // 2 req/sec
  hubspot: { requests: 100, interval: 10000 },     // 100 req/10sec
  calendly: { requests: 50, interval: 60000 },     // 50 req/min
  google_calendar: { requests: 100, interval: 100000 }, // Per-user quota
  crm: { requests: 10, interval: 1000 },             // 10 req/sec
};

// Cache of rate limiters per service
const limiters = new Map();

/**
 * Get rate limiter for a service
 * @param {string} service - Service name
 * @returns {RateLimiter}
 */
export function getLimiter(service) {
  if (!limiters.has(service)) {
    const limits = SERVICE_LIMITS[service] || { requests: 10, interval: 1000 };
    limiters.set(service, new RateLimiter(limits.requests, limits.interval));
  }
  return limiters.get(service);
}

/**
 * Rate-limited fetch wrapper
 * @param {string} service - Service name for rate limiting
 * @param {string} url - Request URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function rateLimitedFetch(service, url, options = {}) {
  const limiter = getLimiter(service);
  await limiter.acquire();
  return fetch(url, options);
}

/**
 * Retry with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffFactor = 2,
    retryOn = [429, 500, 502, 503, 504],
  } = options;
  
  let lastError;
  let delay = initialDelayMs;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // Check if result is a Response with retry status
      if (result instanceof Response && retryOn.includes(result.status)) {
        // Check for Retry-After header
        const retryAfter = result.headers.get('Retry-After');
        if (retryAfter) {
          delay = parseInt(retryAfter, 10) * 1000 || delay;
        }
        
        if (attempt < maxRetries) {
          console.log(`Rate limited (${result.status}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * backoffFactor, maxDelayMs);
          continue;
        }
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Request failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffFactor, maxDelayMs);
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Create a rate-limited API client
 * @param {string} service - Service name
 * @param {string} baseUrl - Base URL for requests
 * @param {Object} headers - Default headers
 * @returns {Object} - API client with rate limiting
 */
export function createRateLimitedClient(service, baseUrl, headers = {}) {
  const limiter = getLimiter(service);
  
  return {
    async request(method, path, options = {}) {
      await limiter.acquire();
      
      const url = `${baseUrl}${path}`;
      const response = await retryWithBackoff(() => 
        fetch(url, {
          method,
          headers: { ...headers, ...options.headers },
          body: options.body ? JSON.stringify(options.body) : undefined,
        })
      );
      
      if (!response.ok) {
        const error = new Error(`${method} ${path} failed: ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      return response.json();
    },
    
    get(path, options) {
      return this.request('GET', path, options);
    },
    
    post(path, body, options = {}) {
      return this.request('POST', path, { ...options, body });
    },
    
    put(path, body, options = {}) {
      return this.request('PUT', path, { ...options, body });
    },
    
    patch(path, body, options = {}) {
      return this.request('PATCH', path, { ...options, body });
    },
    
    delete(path, options) {
      return this.request('DELETE', path, options);
    },
  };
}

export default {
  RateLimiter,
  getLimiter,
  rateLimitedFetch,
  retryWithBackoff,
  createRateLimitedClient,
  SERVICE_LIMITS,
};
