import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Strict rate limit: 3 attempts per IP per hour
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
};

// This endpoint creates the initial admin user
// It should only work if no admin exists yet (one-time setup)
export async function POST(request: Request) {
  // Rate limiting to prevent brute force
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(`admin-setup:${clientIP}`, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    console.warn('Admin setup rate limit exceeded from IP:', clientIP);
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Use service role key to create user
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // SECURITY: Check if any admin already exists - if so, block this endpoint
    const { data: existingAdmins, error: adminCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (adminCheckError) {
      console.error('Error checking for existing admins:', adminCheckError);
      return NextResponse.json(
        { error: 'Failed to verify setup status' },
        { status: 500 }
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.warn('Admin setup attempted but admin already exists. IP:', clientIP);
      return NextResponse.json(
        { error: 'Setup has already been completed. Contact an existing admin.' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      // User exists but no admin - make them admin
      await supabase
        .from('profiles')
        .upsert({ id: existingUser.id, email, role: 'admin' });

      console.log('Existing user promoted to admin:', email);
      return NextResponse.json({ message: 'User updated to admin' });
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    // Set user as admin in profiles
    await supabase
      .from('profiles')
      .upsert({ id: newUser.user.id, email, role: 'admin' });

    console.log('New admin user created:', email);
    return NextResponse.json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
