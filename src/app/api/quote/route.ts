import { NextResponse } from 'next/server';
import { submitQuoteRequest } from '@/lib/supabase/queries';
import { sendQuoteNotification } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { validateQuoteForm } from '@/lib/validation';

// Rate limit: 5 submissions per IP per 15 minutes
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
};

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`quote:${clientIP}`, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();

    // Check honeypot first (silent rejection for bots)
    if (body.website_url && body.website_url.trim().length > 0) {
      // Pretend success to not tip off bots
      console.warn('Honeypot triggered from IP:', clientIP);
      return NextResponse.json({ success: true });
    }

    // Time-based bot detection - reject if form submitted in under 3 seconds
    const MIN_FORM_TIME_MS = 3000; // 3 seconds minimum to fill form
    if (body._t && typeof body._t === 'number') {
      const timeSpent = Date.now() - body._t;
      if (timeSpent < MIN_FORM_TIME_MS) {
        // Pretend success to not tip off bots
        console.warn('Time-based bot detection triggered. Time spent:', timeSpent, 'ms. IP:', clientIP);
        return NextResponse.json({ success: true });
      }
    }

    // Basic required field check
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

    // Comprehensive validation
    const validationResult = validateQuoteForm({
      company: body.company,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      job_title: body.job_title,
      message: body.message,
      honeypot: body.honeypot,
    });

    if (!validationResult.valid) {
      // Silent rejection for honeypot
      if (validationResult.error === 'HONEYPOT_TRIGGERED') {
        console.warn('Honeypot triggered from IP:', clientIP);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(body.recaptcha_token);
    if (!recaptchaResult.success) {
      console.warn('reCAPTCHA verification failed:', recaptchaResult.error, 'Score:', recaptchaResult.score, 'IP:', clientIP);
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Log successful verification for monitoring
    console.log('Quote submission passed verification. Score:', recaptchaResult.score, 'IP:', clientIP);

    const quoteData = {
      company: body.company.trim(),
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      job_title: body.job_title.trim(),
      project_type: body.project_type || null,
      budget_range: body.budget_range || null,
      message: body.message.trim(),
      additional_info: body.additional_info || null,
      how_heard: body.how_heard || null,
    };

    const result = await submitQuoteRequest(quoteData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to submit' },
        { status: 500 }
      );
    }

    // Send email notification (don't fail the request if email fails)
    await sendQuoteNotification(quoteData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quote submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
