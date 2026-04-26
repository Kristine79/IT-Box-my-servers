import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import config from '@/firebase-applet-config.json';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

if (!admin.apps.length) {
  // Use ADC (Application Default Credentials) provided by Google Cloud Run.
  admin.initializeApp({
    projectId: config.projectId,
  });
}

const db = getFirestore(admin.app(), config.firestoreDatabaseId);

function verifyYooKassaWebhook(body: string, signature: string | null, secretKey: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(body);
  const digest = hmac.digest('base64');
  return digest === signature;
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
    if (!YOOKASSA_SECRET_KEY) {
      console.error('YOOKASSA_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const signature = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!verifyYooKassaWebhook(bodyText, signature, YOOKASSA_SECRET_KEY)) {
      console.error('Invalid YooKassa webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (body.event === 'payment.succeeded') {
      const payment = body.object;
      const uid = payment.metadata?.uid;

      if (!uid) {
        console.error('No UID in payment metadata');
        return NextResponse.json({ error: 'No UID in payment metadata' }, { status: 400 });
      }

      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const now = new Date();

      if (userDoc.exists) {
        let currentSubEnd = userDoc.data()?.subscriptionEndsAt;
        let newEnd = new Date(now.getTime() + THIRTY_DAYS);

        // If currently valid, add 30 days to existing subscription
        if (currentSubEnd) {
          const currentSubDate = new Date(currentSubEnd);
          if (currentSubDate > now) {
            newEnd = new Date(currentSubDate.getTime() + THIRTY_DAYS);
          }
        }

        await userRef.update({
          subscriptionEndsAt: newEnd.toISOString()
        });

      } else {
        // Fallback if doc was deleted, mostly an edge case
        await userRef.set({
          subscriptionEndsAt: new Date(now.getTime() + THIRTY_DAYS).toISOString()
        }, { merge: true });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
