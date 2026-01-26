import { NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/supabase/queries';
import { sendNewsletterWelcome } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { validateEmail } from '@/lib/validation';

// Rate limit: 3 subscriptions per IP per hour
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
};

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`newsletter:${clientIP}`, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(body.email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
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

    const result = await subscribeToNewsletter(body.email.trim().toLowerCase());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Send welcome email (don't fail the request if email fails)
    await sendNewsletterWelcome(body.email.trim().toLowerCase());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
