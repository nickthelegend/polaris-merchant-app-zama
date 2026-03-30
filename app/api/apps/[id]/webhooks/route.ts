import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('app_id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhooks });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const { url, events } = body;

    // Generate a random secret for HMAC
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // Explicitly cast or use any if types are problematic in this environment
    const { data: webhook, error } = await (supabase
        .from('webhooks') as any)
        .insert({
            app_id: id,
            url,
            events: events || ['payment.settled'],
            secret,
            is_active: true
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook });
}
