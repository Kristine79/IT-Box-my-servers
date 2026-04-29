/**
 * Rate Limiter - API Gateway Security Control
 * Skill: implementing-api-gateway-security-controls
 * 
 * Implements Redis-backed rate limiting with multiple strategies:
 * - Fixed window counter
 * - Token bucket (for burst tolerance)
 * - Per-user and per-IP tracking
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Redis key prefix
  skipSuccessfulRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  burstTokens?: number;
  lastRefill?: number;
}

// In-memory store for serverless environment (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations per endpoint type
export const RATE_LIMITS = {
  // Critical endpoints - strict limits
  CRYPTO: {
    encrypt: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'crypto:enc' },
    decrypt: { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: 'crypto:dec' },
  },
  // Authentication endpoints
  AUTH: {
    login: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'auth:login' },
    verify: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'auth:verify' },
  },
  // General API
  DEFAULT: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'api:default' },
  // AI endpoints
  AI: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: 'ai:chat' },
};

/**
 * Generate rate limit key from request
 * Combines user ID (if authenticated) + IP address
 */
function getRateLimitKey(req: NextRequest, config: RateLimitConfig): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
  const userId = req.headers.get('x-user-id') || 'anonymous';
  return `${config.keyPrefix}:${userId}:${ip}`;
}

/**
 * Fixed window rate limiting implementation
 * Simple but can have burst issues at window boundaries
 */
export function checkFixedWindowLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Window expired or new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Token bucket rate limiting for burst tolerance
 * Allows bursts while maintaining average rate
 */
export function checkTokenBucket(
  key: string,
  config: RateLimitConfig & { burstSize?: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const burstSize = config.burstSize || config.maxRequests;
  const refillRate = config.maxRequests / (config.windowMs / 1000); // tokens per second

  let entry = rateLimitStore.get(key) as RateLimitEntry & { burstTokens: number; lastRefill: number };

  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      burstTokens: burstSize,
      lastRefill: now,
    };
  }

  // Refill tokens based on time elapsed
  const timePassed = (now - entry.lastRefill) / 1000;
  const tokensToAdd = timePassed * refillRate;
  entry.burstTokens = Math.min(burstSize, entry.burstTokens + tokensToAdd);
  entry.lastRefill = now;

  if (entry.burstTokens < 1) {
    rateLimitStore.set(key, entry);
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + Math.ceil(1000 / refillRate),
    };
  }

  entry.burstTokens -= 1;
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.floor(entry.burstTokens),
    resetTime: now + config.windowMs,
  };
}

/**
 * Main rate limiting middleware
 * Use in API routes for protection
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const key = getRateLimitKey(req, config);
    const result = checkTokenBucket(key, config);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(config.maxRequests));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000) },
        { status: 429, headers }
      );
    }

    // Call handler and add headers to response
    const response = await handler(req);
    result.remaining >= 0 && headers.set('X-RateLimit-Remaining', String(result.remaining));
    
    // Merge headers into response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Higher-order function for API route protection
 * Example usage in route.ts:
 * 
 * export const POST = withRateLimitProtection(
 *   async (req) => { ... },
 *   RATE_LIMITS.CRYPTO.encrypt
 * );
 */
export function withRateLimitProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
): (req: NextRequest) => Promise<NextResponse> {
  return withRateLimit(handler, config);
}

/**
 * Cleanup old entries periodically (for memory management)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 60000) { // Keep 1 minute grace period
      rateLimitStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
