import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface AdminAuthResult {
  authenticated: boolean;
  error?: string;
  userId?: string;
}

/**
 * Check if the current request is from an authenticated admin user.
 * Use this in admin API routes to protect them.
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { authenticated: false, error: 'Not authenticated' };
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { authenticated: false, error: 'User profile not found' };
    }

    if (profile.role !== 'admin') {
      return { authenticated: false, error: 'Admin access required' };
    }

    return { authenticated: true, userId: user.id };
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return { authenticated: false, error: 'Authentication check failed' };
  }
}

/**
 * Helper to return 401/403 response for unauthorized requests.
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}
