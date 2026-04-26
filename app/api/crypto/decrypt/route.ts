import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const MAX_ENCRYPTED_LENGTH = 10000;

export async function POST(req: Request) {
  try {
    const { encrypted, iv, authTag } = await req.json();
    if (!encrypted || !iv || !authTag) {
      return NextResponse.json({ error: 'Missing encryption parameters' }, { status: 400 });
    }
    if (typeof encrypted !== 'string' || typeof iv !== 'string' || typeof authTag !== 'string') {
      return NextResponse.json({ error: 'Invalid parameter types' }, { status: 400 });
    }
    if (encrypted.length > MAX_ENCRYPTED_LENGTH || iv.length > 200 || authTag.length > 200) {
      return NextResponse.json({ error: 'Parameter length exceeds maximum' }, { status: 400 });
    }

    const secretKey = process.env.AES_SECRET_KEY;
    if (!secretKey || secretKey.length !== 64) {
      console.error("AES_SECRET_KEY is improperly configured.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const key = Buffer.from(secretKey, 'hex');
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return NextResponse.json({
      decrypted,
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
  }
}
