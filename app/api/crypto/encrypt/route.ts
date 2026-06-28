import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withApiProtection, RATE_LIMITS, secureJsonResponse, secureErrorResponse } from '@/lib/security';
import { withFirebaseAuth } from '@/lib/security/firebase-auth';
import type { AuthenticatedRequest } from '@/lib/security/firebase-auth';
import { z } from 'zod';

const ALGORITHM = 'aes-256-gcm';
const MAX_TEXT_LENGTH = 5000;

// Validation schema
const encryptSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
});

async function encryptHandler(req: AuthenticatedRequest, user: { uid: string }): Promise<NextResponse> {
  try {
    const { text } = await req.json();
    
    const secretKey = process.env.AES_SECRET_KEY;
    if (!secretKey || secretKey.length !== 64) {
      // Log security event instead of console.error
      const { logSecurityEvent } = await import('@/lib/security');
      logSecurityEvent(
        req,
        'encryption_failure',
        'critical',
        { reason: 'AES_SECRET_KEY not configured', userId: user.uid }
      );
      return secureErrorResponse('Server configuration error', 500);
    }

    const key = Buffer.from(secretKey, 'hex');
    const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');

    return secureJsonResponse({
      encrypted,
      iv: iv.toString('base64'),
      authTag,
    });
  } catch (error) {
    const { logSecurityEvent } = await import('@/lib/security');
    logSecurityEvent(
      req,
      'encryption_failure',
      'high',
      { error: error instanceof Error ? error.message : 'Unknown error', userId: user.uid }
    );
    return secureErrorResponse('Encryption failed', 500);
  }
}

// Apply Firebase auth + rate limiting + security headers
export const POST = withFirebaseAuth(
  (req, user) => withApiProtection(
    async (request) => encryptHandler(request as AuthenticatedRequest, user),
    encryptSchema,
    RATE_LIMITS.CRYPTO.encrypt
  )(req),
  { required: true }
);
