import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load env vars from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'set' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Reading local translation files...');
  const enMessages = JSON.parse(readFileSync('messages/en.json', 'utf8'));
  const frMessages = JSON.parse(readFileSync('messages/fr.json', 'utf8'));
  const esMessages = JSON.parse(readFileSync('messages/es.json', 'utf8'));

  console.log('Updating English translations...');
  const { error: enError } = await supabase
    .from('translations')
    .update({ messages: enMessages })
    .eq('locale', 'en');

  if (enError) {
    console.error('Error updating English:', enError);
    process.exit(1);
  }
  console.log('✓ English translations updated');

  console.log('Updating French translations...');
  const { error: frError } = await supabase
    .from('translations')
    .update({ messages: frMessages })
    .eq('locale', 'fr');

  if (frError) {
    console.error('Error updating French:', frError);
    process.exit(1);
  }
  console.log('✓ French translations updated');

  console.log('Upserting Spanish translations...');
  const { error: esError } = await supabase
    .from('translations')
    .upsert({ locale: 'es', messages: esMessages }, { onConflict: 'locale' });

  if (esError) {
    console.error('Error upserting Spanish:', esError);
    process.exit(1);
  }
  console.log('✓ Spanish translations updated');

  console.log('\nDone! Translations synced to Supabase.');
}

main();
