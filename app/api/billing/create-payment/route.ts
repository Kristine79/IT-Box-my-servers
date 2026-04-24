import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { uid, email } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
    }

    const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
    const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      // In development, might simulate success or return error
      console.warn('YooKassa credentials are not set in environment variables.');
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const idempotenceKey = crypto.randomUUID();
    const returnUrl = `${process.env.APP_URL || 'http://localhost:3000'}/`; // Return to dashboard

    const basicAuth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const paymentPayload = {
      amount: {
        value: '300.00',
        currency: 'RUB'
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description: 'StackBox 1-month subscription',
      metadata: { uid }
    };

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify(paymentPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('YooKassa Error:', errText);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    const yookassaData = await response.json();
    return NextResponse.json({ url: yookassaData.confirmation.confirmation_url });

  } catch (error: any) {
    console.error('Create Payment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
