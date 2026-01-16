import { NextResponse } from 'next/server';
import { createSupabaseBuildClient } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';

// GET - Read translations from Supabase
export async function GET() {
  try {
    const supabase = createSupabaseBuildClient();

    const { data: enData, error: enError } = await supabase
      .from('translations')
      .select('messages')
      .eq('locale', 'en')
      .single();

    const { data: frData, error: frError } = await supabase
      .from('translations')
      .select('messages')
      .eq('locale', 'fr')
      .single();

    if (enError || frError || !enData || !frData) {
      console.error('Error reading translations:', enError || frError);
      return NextResponse.json(
        { error: 'Failed to read translations from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      en: enData.messages,
      fr: frData.messages,
    });
  } catch (error) {
    console.error('Error reading translations:', error);
    return NextResponse.json(
      { error: 'Failed to read translations' },
      { status: 500 }
    );
  }
}

// POST - Save translations to Supabase and revalidate cache
export async function POST(request: Request) {
  try {
    const { en, fr } = await request.json();

    if (!en || !fr) {
      return NextResponse.json(
        { error: 'Both en and fr translations are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseBuildClient();

    // Update English translations
    const { error: enError } = await supabase
      .from('translations')
      .update({ messages: en })
      .eq('locale', 'en');

    if (enError) {
      console.error('Error saving English translations:', enError);
      return NextResponse.json(
        { error: 'Failed to save English translations' },
        { status: 500 }
      );
    }

    // Update French translations
    const { error: frError } = await supabase
      .from('translations')
      .update({ messages: fr })
      .eq('locale', 'fr');

    if (frError) {
      console.error('Error saving French translations:', frError);
      return NextResponse.json(
        { error: 'Failed to save French translations' },
        { status: 500 }
      );
    }

    // Revalidate the translations cache
    revalidateTag('translations');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving translations:', error);
    return NextResponse.json(
      { error: 'Failed to save translations' },
      { status: 500 }
    );
  }
}
