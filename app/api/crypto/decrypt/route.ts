import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withApiProtection, RATE_LIMITS, secureJsonResponse, secureErrorResponse } from '@/lib/security';
import { z } from 'zod';

const ALGORITHM = 'aes-256-gcm';
const MAX_ENCRYPTED_LENGTH = 10000;

// Validation schema
const decryptSchema = z.object({
  encrypted: z.string().min(1).max(MAX_ENCRYPTED_LENGTH),
  iv: z.string().regex(/^[A-Za-z0-9+/=]+$/, 'Invalid base64'),
  authTag: z.string().regex(/^[A-Za-z0-9+/=]+$/, 'Invalid base64'),
});

async function decryptHandler(req: Request): Promise<NextResponse> {
  try {
    const { encrypted, iv, authTag } = await req.json();
    
    const secretKey = process.env.AES_SECRET_KEY;
    if (!secretKey || secretKey.length !== 64) {
      console.error("AES_SECRET_KEY is improperly configured.");
      return secureErrorResponse('Server configuration error', 500);
    }

    const key = Buffer.from(secretKey, 'hex');
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return secureJsonResponse({ decrypted });
  } catch (error) {
    console.error('Decryption error:', error);
    return secureErrorResponse('Decryption failed', 500);
  }
}

// Apply rate limiting and security headers
export const POST = withApiProtection(
  async (req) => decryptHandler(req),
  decryptSchema,
  RATE_LIMITS.CRYPTO.decrypt
);
