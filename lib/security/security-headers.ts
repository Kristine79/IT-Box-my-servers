/**
 * Security Headers - Serverless Function Hardening
 * Skill: securing-serverless-functions
 * 
 * Implements OWASP-recommended security headers for API responses.
 * Prevents common attacks: XSS, clickjacking, MIME sniffing, etc.
 */

import { NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  // Content Security Policy
  contentSecurityPolicy?: string;
  // Strict Transport Security (HSTS)
  hstsMaxAge?: number;
  hstsIncludeSubDomains?: boolean;
  hstsPreload?: boolean;
  // Frame Options
  frameOptions?: 'DENY' | 'SAMEORIGIN';
  // Content Type Options
  contentTypeOptions?: boolean;
  // XSS Protection
  xssProtection?: '0' | '1; mode=block';
  // Referrer Policy
  referrerPolicy?: string;
  // Permissions Policy
  permissionsPolicy?: string;
  // Remove server fingerprinting headers
  removeServerHeader?: boolean;
  // Cache control for sensitive data
  cacheControl?: string;
}

// Default secure configuration
const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  hstsMaxAge: 31536000, // 1 year
  hstsIncludeSubDomains: true,
  hstsPreload: true,
  frameOptions: 'DENY',
  contentTypeOptions: true,
  xssProtection: '0', // Disabled in favor of CSP (modern approach)
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  removeServerHeader: true,
  cacheControl: 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

// API-specific relaxed CSP (allows API responses)
const API_SECURITY_CONFIG: SecurityHeadersConfig = {
  ...DEFAULT_SECURITY_CONFIG,
  contentSecurityPolicy: "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  cacheControl: 'no-store, max-age=0',
};

/**
 * Apply security headers to a NextResponse
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = API_SECURITY_CONFIG
): NextResponse {
  const headers = response.headers;

  // Strict Transport Security (HSTS)
  if (config.hstsMaxAge) {
    let hstsValue = `max-age=${config.hstsMaxAge}`;
    if (config.hstsIncludeSubDomains) hstsValue += '; includeSubDomains';
    if (config.hstsPreload) hstsValue += '; preload';
    headers.set('Strict-Transport-Security', hstsValue);
  }

  // Content Security Policy
  if (config.contentSecurityPolicy) {
    headers.set('Content-Security-Policy', config.contentSecurityPolicy);
  }

  // X-Frame-Options (Clickjacking protection)
  if (config.frameOptions) {
    headers.set('X-Frame-Options', config.frameOptions);
  }

  // X-Content-Type-Options (MIME sniffing protection)
  if (config.contentTypeOptions) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }

  // X-XSS-Protection (legacy, mostly superseded by CSP)
  if (config.xssProtection) {
    headers.set('X-XSS-Protection', config.xssProtection);
  }

  // Referrer Policy
  if (config.referrerPolicy) {
    headers.set('Referrer-Policy', config.referrerPolicy);
  }

  // Permissions Policy (Feature Policy)
  if (config.permissionsPolicy) {
    headers.set('Permissions-Policy', config.permissionsPolicy);
  }

  // Cache Control for sensitive data
  if (config.cacheControl) {
    headers.set('Cache-Control', config.cacheControl);
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }

  // Remove fingerprinting headers
  if (config.removeServerHeader) {
    headers.delete('X-Powered-By');
    headers.delete('Server');
  }

  // Additional security headers
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return response;
}

/**
 * Create a secure JSON response with security headers
 */
export function secureJsonResponse(
  data: unknown,
  status: number = 200,
  config?: SecurityHeadersConfig
): NextResponse {
  const response = NextResponse.json(data, { status });
  return applySecurityHeaders(response, config);
}

/**
 * Create a secure error response with security headers
 */
export function secureErrorResponse(
  error: string,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  const response = NextResponse.json(
    { error, ...(details && { details }) },
    { status }
  );
  return applySecurityHeaders(response);
}

/**
 * Higher-order function to wrap API handlers with security headers
 */
export function withSecurityHeaders(
  handler: (req: Request) => Promise<NextResponse>,
  config?: SecurityHeadersConfig
) {
  return async (req: Request): Promise<NextResponse> => {
    const response = await handler(req);
    return applySecurityHeaders(response, config);
  };
}

/**
 * CORS configuration for API endpoints
 * Restrictive by default, configurable per endpoint
 */
export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [], // Empty = no CORS (same-origin only)
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowCredentials: false,
  maxAge: 86400,
};

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  response: NextResponse,
  origin: string,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): NextResponse {
  const headers = response.headers;

  // Check if origin is allowed
  const isAllowed = config.allowedOrigins.length === 0 || 
                    config.allowedOrigins.includes(origin) ||
                    config.allowedOrigins.includes('*');

  if (isAllowed) {
    headers.set('Access-Control-Allow-Origin', config.allowedOrigins.includes('*') ? '*' : origin);
  }

  headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  headers.set('Access-Control-Max-Age', String(config.maxAge));

  if (config.allowCredentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(config: CorsConfig = DEFAULT_CORS_CONFIG): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, '*', config);
}
