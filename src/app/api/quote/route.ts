import { NextResponse } from 'next/server';
import { submitQuoteRequest } from '@/lib/supabase/queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (
      !body.company ||
      !body.first_name ||
      !body.last_name ||
      !body.email ||
      !body.job_title ||
      !body.message
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Add reCAPTCHA validation here

    const result = await submitQuoteRequest({
      company: body.company,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      job_title: body.job_title,
      project_type: body.project_type || null,
      budget_range: body.budget_range || null,
      message: body.message,
      additional_info: body.additional_info || null,
      how_heard: body.how_heard || null,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to submit' },
        { status: 500 }
      );
    }

    // TODO: Send email notification via Supabase Edge Function or Resend

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quote submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
