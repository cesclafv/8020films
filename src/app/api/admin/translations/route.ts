import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

// GET - Read translation files
export async function GET() {
  try {
    const enContent = await fs.readFile(path.join(MESSAGES_DIR, 'en.json'), 'utf-8');
    const frContent = await fs.readFile(path.join(MESSAGES_DIR, 'fr.json'), 'utf-8');

    return NextResponse.json({
      en: JSON.parse(enContent),
      fr: JSON.parse(frContent),
    });
  } catch (error) {
    console.error('Error reading translations:', error);
    return NextResponse.json(
      { error: 'Failed to read translations' },
      { status: 500 }
    );
  }
}

// POST - Save translation files
export async function POST(request: Request) {
  try {
    const { en, fr } = await request.json();

    if (!en || !fr) {
      return NextResponse.json(
        { error: 'Both en and fr translations are required' },
        { status: 400 }
      );
    }

    // Write with pretty formatting
    await fs.writeFile(
      path.join(MESSAGES_DIR, 'en.json'),
      JSON.stringify(en, null, 2),
      'utf-8'
    );
    await fs.writeFile(
      path.join(MESSAGES_DIR, 'fr.json'),
      JSON.stringify(fr, null, 2),
      'utf-8'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving translations:', error);
    return NextResponse.json(
      { error: 'Failed to save translations - make sure to edit on localhost and rebuild' },
      { status: 500 }
    );
  }
}
