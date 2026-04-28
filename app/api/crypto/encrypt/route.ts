import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withApiProtection, RATE_LIMITS, secureJsonResponse, secureErrorResponse } from '@/lib/security';
import { z } from 'zod';

const ALGORITHM = 'aes-256-gcm';
const MAX_TEXT_LENGTH = 5000;

// Validation schema
const encryptSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
});

async function encryptHandler(req: Request): Promise<NextResponse> {
  try {
    const { text } = await req.json();
    
    const secretKey = process.env.AES_SECRET_KEY;
    if (!secretKey || secretKey.length !== 64) {
      console.error("AES_SECRET_KEY is improperly configured.");
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
    console.error('Encryption error:', error);
    return secureErrorResponse('Encryption failed', 500);
  }
}

// Apply rate limiting and security headers
export const POST = withApiProtection(
  async (req) => encryptHandler(req),
  encryptSchema,
  RATE_LIMITS.CRYPTO.encrypt
);
