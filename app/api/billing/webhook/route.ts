import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import config from '@/firebase-applet-config.json';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (saJson) {
    // Vercel / external host: explicit Service Account credentials
    try {
      const serviceAccount = JSON.parse(saJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || config.projectId,
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
      admin.initializeApp({ projectId: config.projectId });
    }
  } else {
    // Google Cloud Run: Application Default Credentials
    admin.initializeApp({ projectId: config.projectId });
  }
}

const db = getFirestore(admin.app(), config.firestoreDatabaseId);

// YooKassa official IP ranges for webhook notifications
// https://yookassa.ru/developers/using-api/webhooks
const YOOKASSA_IP_RANGES = [
  '185.71.76.',   // 185.71.76.0/27
  '185.71.77.',   // 185.71.77.0/27
  '77.75.153.',   // 77.75.153.0/25
  '77.75.154.',   // 77.75.154.128/25
  '77.75.156.',   // 77.75.156.11, 77.75.156.35
  '2a02:5180:',   // IPv6 2a02:5180::/32
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
      const planId = verified.metadata?.planId || 'standard';
      if (!uid) {
        console.error('No UID in payment metadata');
        return NextResponse.json({ error: 'No UID in payment metadata' }, { status: 400 });
      }

      // Idempotency guard: skip if this paymentId already processed
      const processedRef = db.collection('processedPayments').doc(paymentId);
      const processedSnap = await processedRef.get();
      if (processedSnap.exists) {
        console.log(`Payment ${paymentId} already processed, skipping`);
        return NextResponse.json({ status: 'ok', duplicate: true });
      }

      const userRef = db.collection('users').doc(uid);
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const now = new Date();

      // Atomic update inside a transaction so concurrent webhooks can't double-extend
      await db.runTransaction(async (tx) => {
        const userDoc = await tx.get(userRef);
        const currentSubEnd = userDoc.exists ? userDoc.data()?.subscriptionEndsAt : null;

        let newEnd = new Date(now.getTime() + THIRTY_DAYS);
        if (currentSubEnd) {
          const currentSubDate = new Date(currentSubEnd);
          if (currentSubDate > now) {
            newEnd = new Date(currentSubDate.getTime() + THIRTY_DAYS);
          }
        }

        if (userDoc.exists) {
          tx.update(userRef, { subscriptionEndsAt: newEnd.toISOString(), plan: planId });
        } else {
          tx.set(userRef, { subscriptionEndsAt: newEnd.toISOString(), plan: planId }, { merge: true });
        }

        tx.set(processedRef, {
          uid,
          amount: verified.amount?.value,
          currency: verified.amount?.currency,
          processedAt: FieldValue.serverTimestamp(),
        });
      });

      console.log(`Subscription activated for user ${uid}, payment ${paymentId}`);
    }

    if (body.event === 'payment.canceled') {
      const paymentId = body.object?.id;
      console.log(`Payment canceled: ${paymentId}`);
      // No action needed — subscription was never granted
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
