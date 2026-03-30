import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    const walletAddress = req.headers.get('x-wallet-address');

    if (!walletAddress) {
        return NextResponse.json({ error: 'Missing wallet address header' }, { status: 400 });
    }

    const db = await getDb();

    // 1. Get User
    const user = await db.collection('merchant_users').findOne({ wallet_address: walletAddress });

    if (!user) {
        return NextResponse.json({ apps: [] }); // User not found, so no apps
    }

    // 2. Get Apps
    const apps = await db.collection('merchant_apps')
        .find({ user_id: walletAddress })
        .sort({ created_at: -1 })
        .toArray();

    return NextResponse.json({ apps });
}

export async function POST(req: NextRequest) {
    try {
        const { wallet_address, name, category } = await req.json();

        if (!wallet_address || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();

        // 1. Get User (or fail)
        const user = await db.collection('merchant_users').findOne({ wallet_address });

        if (!user) {
            return NextResponse.json({ error: 'User not registered. Please refresh.' }, { status: 404 });
        }

        // 2. Create App with explicitly generated credentials
        const client_id = `prod_${crypto.randomBytes(12).toString('hex')}`;
        const client_secret = `sk_${crypto.randomBytes(24).toString('hex')}`;

        const newApp = {
            user_id: wallet_address,
            name,
            category,
            client_id,
            client_secret,
            network: 'sepolia',
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('merchant_apps').insertOne(newApp);

        return NextResponse.json({ app: { ...newApp, _id: result.insertedId } });
    } catch (error: any) {
        console.error('Create App Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
