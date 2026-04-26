import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import config from '@/firebase-applet-config.json';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  // Use ADC (Application Default Credentials) provided by Google Cloud Run.
  admin.initializeApp({
    projectId: config.projectId,
  });
}

const db = getFirestore(admin.app(), config.firestoreDatabaseId);

// YooKassa official IP ranges for webhook notifications
const YOOKASSA_IP_RANGES = [
  '185.71.76.',   // 185.71.76.0/27
  '185.71.77.',   // 185.71.77.0/27
  '77.75.153.',   // 77.75.153.0/25
  '77.75.156.',   // 77.75.156.11, 77.75.156.35
];

function isYooKassaIP(ip: string): boolean {
  // Strip IPv6 prefix if present (::ffff:1.2.3.4)
  const cleanIP = ip.replace(/^::ffff:/, '');
  return YOOKASSA_IP_RANGES.some(range => cleanIP.startsWith(range));
}

// Verify payment status directly with YooKassa API
async function verifyPaymentWithYooKassa(paymentId: string): Promise<any> {
  const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
  const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) return null;

  const basicAuth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

  const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: {
      'Authorization': `Basic ${basicAuth}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
}

export async function POST(req: Request) {
  try {
    // Check source IP (Vercel passes it in x-forwarded-for)
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const sourceIP = forwardedFor.split(',')[0].trim();

    if (sourceIP && !isYooKassaIP(sourceIP)) {
      console.warn(`Webhook from untrusted IP: ${sourceIP}`);
      // Don't reject — IP check is advisory on Vercel due to proxy layers.
      // We verify payment status via API callback below instead.
    }

    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    if (body.event === 'payment.succeeded') {
      const payment = body.object;
      const paymentId = payment.id;

      if (!paymentId) {
        console.error('No payment ID in webhook body');
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Verify payment status directly with YooKassa API (prevents spoofed webhooks)
      const verified = await verifyPaymentWithYooKassa(paymentId);
      if (!verified || verified.status !== 'succeeded') {
        console.error(`Payment ${paymentId} verification failed: status=${verified?.status}`);
        return NextResponse.json({ error: 'Payment not verified' }, { status: 403 });
      }

      const uid = verified.metadata?.uid;
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

      console.log(`Subscription activated for user ${uid}, payment ${paymentId}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
