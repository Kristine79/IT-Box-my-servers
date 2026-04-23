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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // The YooKassa webhook payload:
    // {
    //   "type": "notification",
    //   "event": "payment.succeeded",
    //   "object": { ... payment object ... }
    // }

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
