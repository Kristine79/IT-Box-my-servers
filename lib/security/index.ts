/**
 * Security Utilities - Integrated Security Layer
 * 
 * Applies 754 Cybersecurity Skills Library:
 * - implementing-api-gateway-security-controls
 * - securing-serverless-functions  
 * - implementing-jwt-signing-and-verification
 * - detecting-anomalous-authentication-patterns
 * - implementing-aes-encryption-for-data-at-rest
 */

// Rate limiting
export {
  withRateLimitProtection,
  withRateLimit,
  RATE_LIMITS,
  checkFixedWindowLimit,
  checkTokenBucket,
} from './rate-limiter';

// Security headers
export {
  applySecurityHeaders,
  secureJsonResponse,
  secureErrorResponse,
  withSecurityHeaders,
  handleCorsPreflight,
  applyCorsHeaders,
} from './security-headers';

// Request validation
export {
  withBodyValidation,
  validateRequestBody,
  validateQueryParams,
  validationErrorResponse,
  containsDangerousPatterns,
  sanitizeInput,
  ValidationSchemas,
  Schemas,
} from './request-validator';

// Security logging & anomaly detection
export {
  logSecurityEvent,
  logAuthFailure,
  logRateLimitViolation,
  logSuspiciousInput,
  getSecuritySummary,
  exportSecurityEvents,
} from './security-logger';

// Security middleware composition
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from './rate-limiter';
import { withSecurityHeaders } from './security-headers';
import { withBodyValidation } from './request-validator';
import { logSecurityEvent } from './security-logger';

/**
 * Complete API route protection
 * Combines rate limiting + security headers + validation
 */
export function withApiProtection<T>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse>,
  schema: import('zod').ZodSchema<T>,
  rateLimitConfig = RATE_LIMITS.DEFAULT
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      const rateLimitedHandler = withRateLimit(
        async (r) => {
          // Apply body validation
          const validatedHandler = withBodyValidation(
            async (request, data) => handler(request as NextRequest, data),
            schema
          );
          return validatedHandler(r);
        },
        rateLimitConfig
      );

      const response = await rateLimitedHandler(req);
      
      // Add security headers
      return withSecurityHeaders(async () => response)(req);
    } catch (error) {
      logSecurityEvent(
        req,
        'api_error',
        'high',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
