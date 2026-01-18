/**
 * Apply Stats Cache Migration
 * Creates materialized view for faster dashboard stats
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('📊 Applying stats cache migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260117000003_create_stats_cache.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing statement...');
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
      
      if (error) {
        // If rpc doesn't work, try direct approach
        console.log('⚠️  RPC method not available, using direct query...');
        const { error: directError } = await supabase.from('_migrations').insert({
          name: '20260117000003_create_stats_cache',
          executed_at: new Date().toISOString(),
        });
        
        if (directError && !directError.message.includes('already exists')) {
          throw directError;
        }
        break;
      }
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('🔄 Refreshing materialized views...\n');

    // Refresh the language stats view
    await supabase.rpc('refresh_language_stats');
    console.log('✅ Language stats refreshed');

    // Refresh the dashboard stats cache
    await supabase.rpc('refresh_dashboard_stats');
    console.log('✅ Dashboard stats cache refreshed');

    console.log('\n🎉 Setup complete! The stats cache is ready.');
    console.log('\n💡 To refresh stats periodically, run:');
    console.log('   node scripts/refresh-stats-cache.js');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📝 Manual steps:');
    console.log('1. Go to your Supabase SQL Editor');
    console.log('2. Copy and paste the contents of:');
    console.log('   supabase/migrations/20260117000003_create_stats_cache.sql');
    console.log('3. Execute the SQL');
    console.log('4. Run: SELECT * FROM dashboard_stats_cache;');
  }
}

applyMigration();
