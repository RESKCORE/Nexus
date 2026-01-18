/**
 * Refresh Stats Cache
 * Run this script to refresh the materialized views
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshCache() {
  try {
    console.log('🔄 Refreshing dashboard stats cache...\n');

    // Refresh the language stats view
    const { error: langError } = await supabase.rpc('refresh_language_stats');
    if (langError) {
      console.warn('⚠️  Language stats refresh:', langError.message);
    } else {
      console.log('✅ Language stats refreshed');
    }

    // Refresh the dashboard stats cache
    const { error: statsError } = await supabase.rpc('refresh_dashboard_stats');
    if (statsError) {
      console.warn('⚠️  Dashboard stats refresh:', statsError.message);
    } else {
      console.log('✅ Dashboard stats cache refreshed');
    }

    // Verify the cache
    const { data, error } = await supabase
      .from('dashboard_stats_cache')
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    console.log('\n📊 Current Stats:');
    console.log(`   Repositories: ${Number(data.total_repos).toLocaleString()}`);
    console.log(`   Stars: ${Number(data.total_stars).toLocaleString()}`);
    console.log(`   Commits: ${Number(data.total_commits).toLocaleString()}`);
    console.log(`   Languages: ${data.unique_languages}`);
    console.log(`   Last Updated: ${new Date(data.last_updated).toLocaleString()}`);

    console.log('\n✨ Cache refresh complete!');
  } catch (error) {
    console.error('❌ Error refreshing cache:', error.message);
    process.exit(1);
  }
}

refreshCache();
