/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP - Webhook Security
 * ═══════════════════════════════════════════════════════════════════════════
 * Signature verification for webhooks from various services
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @param {string} secret - Webhook signing secret (whsec_...)
 * @returns {{ verified: boolean, timestamp?: number, error?: string }}
 */
export function verifyStripeSignature(payload, signature, secret) {
  try {
    const elements = signature.split(',');
    const timestampElement = elements.find(e => e.startsWith('t='));
    const signatureElement = elements.find(e => e.startsWith('v1='));
    
    if (!timestampElement || !signatureElement) {
      return { verified: false, error: 'Invalid signature format' };
    }
    
    const timestamp = parseInt(timestampElement.split('=')[1], 10);
    const expectedSignature = signatureElement.split('=')[1];
    
    // Check timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return { verified: false, error: 'Timestamp outside tolerance' };
    }
    
    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const computedSignature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    // Timing-safe comparison
    const verified = timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(computedSignature)
    );
    
    return { verified, timestamp };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Verify CRM webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-CRM-Signature header
 * @param {string} secret - Webhook signing secret
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifyCrmSignature(payload, signature, secret) {
  try {
    // CRM uses HMAC-SHA256
    const computedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const verified = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Verify Slack webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Slack-Signature header
 * @param {string} timestamp - X-Slack-Request-Timestamp header
 * @param {string} secret - Slack signing secret
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifySlackSignature(payload, signature, timestamp, secret) {
  try {
    // Check timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
      return { verified: false, error: 'Timestamp outside tolerance' };
    }
    
    // Compute expected signature
    const baseString = `v0:${timestamp}:${payload}`;
    const computedSignature = 'v0=' + createHmac('sha256', secret)
      .update(baseString)
      .digest('hex');
    
    const verified = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Verify GitHub webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Hub-Signature-256 header
 * @param {string} secret - Webhook secret
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifyGitHubSignature(payload, signature, secret) {
  try {
    const computedSignature = 'sha256=' + createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const verified = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Verify Twilio webhook signature
 * @param {string} url - Full request URL
 * @param {Object} params - POST parameters (sorted)
 * @param {string} signature - X-Twilio-Signature header
 * @param {string} authToken - Twilio auth token
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifyTwilioSignature(url, params, signature, authToken) {
  try {
    // Sort params and append to URL
    let data = url;
    const sortedKeys = Object.keys(params).sort();
    for (const key of sortedKeys) {
      data += key + params[key];
    }
    
    const computedSignature = createHmac('sha1', authToken)
      .update(data)
      .digest('base64');
    
    const verified = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Verify Shopify webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Shopify-Hmac-Sha256 header
 * @param {string} secret - Shopify webhook secret
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifyShopifySignature(payload, signature, secret) {
  try {
    const computedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    
    const verified = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Generic HMAC verification
 * @param {string} payload - Raw request body
 * @param {string} signature - Provided signature
 * @param {string} secret - Signing secret
 * @param {string} algorithm - Hash algorithm (sha256, sha1, etc.)
 * @param {string} encoding - Output encoding (hex, base64)
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifyHmac(payload, signature, secret, algorithm = 'sha256', encoding = 'hex') {
  try {
    const computedSignature = createHmac(algorithm, secret)
      .update(payload)
      .digest(encoding);
    
    const verified = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

export default {
  verifyStripeSignature,
  verifyCrmSignature,
  verifySlackSignature,
  verifyGitHubSignature,
  verifyTwilioSignature,
  verifyShopifySignature,
  verifyHmac,
};
