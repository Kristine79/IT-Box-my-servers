/**
 * Request Validator - API Input Validation
 * Skills: implementing-api-gateway-security-controls, securing-serverless-functions
 * 
 * Implements strict input validation to prevent injection attacks:
 * - SQL injection prevention
 * - NoSQL injection prevention
 * - Command injection prevention
 * - XSS prevention in inputs
 * - Schema validation
 */

import { z, ZodSchema, ZodError } from 'zod';
import { NextResponse } from 'next/server';
import { secureErrorResponse } from './security-headers';

// Common validation schemas
export const ValidationSchemas = {
  // ID validation (UUID or alphanumeric)
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/, 'Invalid ID format'),
  
  // Email validation with length limit
  email: z.string().email().max(256, 'Email too long'),
  
  // Safe text (no HTML/script tags)
  safeText: z.string()
    .min(1)
    .max(10000)
    .refine(
      (val) => !/<script|javascript:|on\w+\s*=|data:text\/html/.test(val),
      'Potentially dangerous content detected'
    ),
  
  // Strict text (alphanumeric + basic punctuation only)
  strictText: z.string()
    .regex(/^[a-zA-Z0-9\s\-_.,!?()@#$%&*+=:;'/\"]+$/, 'Invalid characters in text'),
  
  // URL validation
  url: z.string().url().max(2048),
  
  // IP address validation
  ipAddress: z.union([
    z.string().ip(),
    z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/),
  ]),
  
  // Port number
  port: z.number().int().min(1).max(65535),
};

// Dangerous patterns to check for injection attacks
const DANGEROUS_PATTERNS = {
  sql: [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Basic SQLi
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i, // Equal sign injection
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b/i, // SQL keywords
    /(\%3C)|<[^\n]+(\%3E)|>/i, // HTML tags in SQL
  ],
  nosql: [
    /\$\{/, // Template literal injection
    /\$where/, // MongoDB $where operator
    /\$regex.*\(\s*function/, // Function in regex
    /__proto__|constructor|prototype/, // Prototype pollution
  ],
  command: [
    /[;&|`$(){}[\]\\]/, // Command metacharacters
    /\b(rm|chmod|chown|wget|curl|nc|netcat|bash|sh|cmd|powershell)\b/i,
    /\/bin\//,
    /\.\.\//, // Path traversal
  ],
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ],
};

/**
 * Check if input contains dangerous patterns
 */
export function containsDangerousPatterns(input: string, type: keyof typeof DANGEROUS_PATTERNS): boolean {
  const patterns = DANGEROUS_PATTERNS[type];
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize input by removing dangerous characters
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ZodError }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      error: new ZodError([{
        code: 'custom',
        path: [],
        message: 'Invalid JSON in request body',
      }]),
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: ZodError } {
  const params: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  return { success: true, data: result.data };
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  const issues = error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return secureErrorResponse('Validation failed', 400, { issues });
}

/**
 * Middleware to validate request body
 */
export function withBodyValidation<T>(
  handler: (req: Request, data: T) => Promise<NextResponse>,
  schema: ZodSchema<T>
) {
  return async (req: Request): Promise<NextResponse> => {
    const result = await validateRequestBody(req, schema);
    
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    // Check for injection patterns in string values
    const stringValues = JSON.stringify(result.data).match(/"[^"]+"/g) || [];
    for (const value of stringValues) {
      const cleanValue = value.slice(1, -1); // Remove quotes
      if (containsDangerousPatterns(cleanValue, 'sql') ||
          containsDangerousPatterns(cleanValue, 'nosql') ||
          containsDangerousPatterns(cleanValue, 'command')) {
        return secureErrorResponse('Potentially malicious input detected', 400);
      }
    }

    return handler(req, result.data);
  };
}

// Specific schemas for common operations
export const Schemas = {
  // Crypto operations
  cryptoEncrypt: z.object({
    text: z.string().min(1).max(5000),
  }),
  
  cryptoDecrypt: z.object({
    encrypted: z.string().min(1).max(10000),
    iv: z.string().regex(/^[A-Za-z0-9+/=]+$/, 'Invalid base64'),
    authTag: z.string().regex(/^[A-Za-z0-9+/=]+$/, 'Invalid base64'),
  }),
  
  // Server operations
  serverCreate: z.object({
    name: ValidationSchemas.strictText.max(100),
    ipAddress: ValidationSchemas.ipAddress.optional(),
    provider: ValidationSchemas.strictText.max(100).optional(),
    os: ValidationSchemas.strictText.max(100).optional(),
    notes: ValidationSchemas.safeText.max(2000).optional(),
  }),
  
  // Credential operations
  credentialCreate: z.object({
    name: ValidationSchemas.strictText.max(100),
    username: ValidationSchemas.strictText.max(100).optional(),
    password: z.string().min(1).max(1000),
    serverId: ValidationSchemas.id.optional(),
    serviceId: ValidationSchemas.id.optional(),
    notes: ValidationSchemas.safeText.max(2000).optional(),
  }),
  
  // Service operations
  serviceCreate: z.object({
    name: ValidationSchemas.strictText.max(100),
    url: ValidationSchemas.url.optional(),
    port: ValidationSchemas.port.optional(),
    type: z.enum(['web', 'database', 'api', 'other']),
    serverId: ValidationSchemas.id.optional(),
    notes: ValidationSchemas.safeText.max(2000).optional(),
  }),
  
  // AI chat
  aiChat: z.object({
    message: ValidationSchemas.safeText.max(10000),
    context: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: ValidationSchemas.safeText,
    })).max(50).optional(),
  }),
};
