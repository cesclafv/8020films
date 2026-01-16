import { NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/supabase/queries';
import { sendNewsletterWelcome } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await subscribeToNewsletter(body.email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Send welcome email (don't fail the request if email fails)
    await sendNewsletterWelcome(body.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
