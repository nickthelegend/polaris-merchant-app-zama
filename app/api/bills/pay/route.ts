import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
    const clientId = req.headers.get('x-client-id');
    const clientSecret = req.headers.get('x-client-secret');

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: 'Missing Client Auth Headers (x-client-id, x-client-secret)' },
            { status: 401 }
        );
    }

    const body = await req.json().catch(() => ({}));
    const { billHash, payment_mode, loan_id, tx_hash } = body;

    if (!billHash) {
        return NextResponse.json({ error: 'billHash is required' }, { status: 400 });
    }

    const db = await getDb();

    // Verify API credentials
    const app = await db.collection('merchant_apps').findOne({
        client_id: clientId,
        client_secret: clientSecret,
    });

    if (!app) {
        return NextResponse.json({ error: 'Invalid API Credentials' }, { status: 403 });
    }

    // Find the bill
    const bill = await db.collection('merchant_bills').findOne({
        hash: billHash,
        app_id: app._id,
    });

    if (!bill) {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // If already paid, return success without modifying
    if (bill.status === 'paid') {
        return NextResponse.json({ bill });
    }

    // Transition from pending to paid
    const updated = await db.collection('merchant_bills').findOneAndUpdate(
        { _id: bill._id, status: 'pending' },
        {
            $set: {
                status: 'paid',
                payment_mode: payment_mode || null,
                loan_id: loan_id || null,
                tx_hash: tx_hash || null,
                paid_at: new Date(),
            },
        },
        { returnDocument: 'after' }
    );

    if (!updated) {
        return NextResponse.json({ error: 'Failed to update bill status' }, { status: 500 });
    }

    return NextResponse.json({ bill: updated });
}
