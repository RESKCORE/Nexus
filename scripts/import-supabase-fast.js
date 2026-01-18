/**
 * Import CSV data to Supabase (OPTIMIZED - Top repos only)
 * Run: node scripts/import-supabase-fast.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Import repository_data.csv (TOP 50K REPOS ONLY)
 */
async function importTopRepositories() {
  console.log('\n📦 Importing TOP 50,000 repositories from repository_data.csv...');
  
  const filePath = path.join(__dirname, '..', 'repository_data.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    const allRepos = [];
    
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      step: (result) => {
        const row = result.data;
        
        // Parse languages_used from string to array
        let languages = [];
        if (row.languages_used) {
          try {
            languages = JSON.parse(row.languages_used.replace(/'/g, '"'));
          } catch {
            languages = [];
          }
        }
        
        const record = {
          name: row.name,
          stars_count: parseInt(row.stars_count) || 0,
          forks_count: parseInt(row.forks_count) || 0,
          watchers: parseInt(row.watchers) || 0,
          pull_requests: parseInt(row.pull_requests) || 0,
          primary_language: row.primary_language || null,
          languages_used: languages,
          commit_count: parseFloat(row.commit_count) || 0,
          created_at: row.created_at || null,
          licence: row.licence || null,
        };
        
        allRepos.push(record);
      },
      complete: async () => {
        console.log(`📊 Parsed ${allRepos.length} total repositories`);
        
        // Sort by stars and take top 50K
        console.log('🔝 Sorting by stars and selecting top 50,000...');
        const topRepos = allRepos
          .sort((a, b) => b.stars_count - a.stars_count)
          .slice(0, 50000);
        
        console.log(`✅ Selected top ${topRepos.length} repositories`);
        console.log(`   Highest stars: ${topRepos[0].stars_count.toLocaleString()}`);
        console.log(`   Lowest stars: ${topRepos[topRepos.length - 1].stars_count.toLocaleString()}`);
        
        // Insert in batches
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < topRepos.length; i += batchSize) {
          const batch = topRepos.slice(i, i + batchSize);
          const { error } = await supabase
            .from('repository_data')
            .insert(batch);
          
          if (error) {
            console.error(`\n❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
          } else {
            imported += batch.length;
            const progress = Math.round((imported / topRepos.length) * 100);
            process.stdout.write(`\r✅ Imported: ${imported.toLocaleString()}/${topRepos.length.toLocaleString()} (${progress}%)`);
          }
        }
        
        console.log('\n✅ repository_data.csv imported successfully!\n');
        
        // Refresh materialized view
        console.log('🔄 Refreshing language statistics...');
        const { error } = await supabase.rpc('refresh_language_stats');
        if (!error) {
          console.log('✅ Language statistics refreshed!\n');
        }
        
        resolve();
      },
      error: (error) => {
        console.error('❌ Parse error:', error);
        reject(error);
      },
    });
  });
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting OPTIMIZED Supabase data import...');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Test connection
    const { error } = await supabase.from('repository_data').select('count');
    if (error && !error.message.includes('already')) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    console.log('✅ Connected to Supabase successfully!\n');
    
    // Check if data already exists
    const { count } = await supabase
      .from('repository_data')
      .select('*', { count: 'exact', head: true });
    
    if (count && count > 0) {
      console.log(`⚠️  Found ${count} existing rows in repository_data`);
      console.log('   Clearing existing data...');
      await supabase.from('repository_data').delete().neq('id', 0);
      console.log('✅ Cleared existing data\n');
    }
    
    // Import top repositories
    await importTopRepositories();
    
    console.log('🎉 All data imported successfully!');
    console.log('\n📊 Database Statistics:');
    
    const { count: repoCount } = await supabase
      .from('repositories')
      .select('*', { count: 'exact', head: true });
    
    const { count: repoDataCount } = await supabase
      .from('repository_data')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   - repositories: ${repoCount} rows`);
    console.log(`   - repository_data: ${repoDataCount} rows`);
    console.log('\n✅ Ready to deploy! 🚀\n');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
