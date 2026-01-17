/**
 * Import CSV data to Supabase
 * Run: node scripts/import-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.log('Set these environment variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Import github_dataset.csv (small file - 561 rows)
 */
async function importGithubDataset() {
  console.log('\n📦 Importing github_dataset.csv...');
  
  const filePath = path.join(__dirname, '..', 'github_dataset.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log(`📊 Parsed ${results.data.length} rows`);
        
        // Transform data
        const repositories = results.data.map((row) => ({
          repository_name: row.repositories || 'Unknown',
          stars_count: parseInt(row.stars_count) || 0,
          forks_count: parseInt(row.forks_count) || 0,
          issues_count: parseInt(row.issues_count) || 0,
          pull_requests: parseInt(row.pull_requests) || 0,
          contributors: parseInt(row.contributors) || 0,
          language: row.language === 'NULL' ? null : row.language,
        }));
        
        // Insert in batches of 100
        const batchSize = 100;
        let imported = 0;
        
        for (let i = 0; i < repositories.length; i += batchSize) {
          const batch = repositories.slice(i, i + batchSize);
          const { error } = await supabase.from('repositories').insert(batch);
          
          if (error) {
            console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
          } else {
            imported += batch.length;
            process.stdout.write(`\r✅ Imported: ${imported}/${repositories.length}`);
          }
        }
        
        console.log('\n✅ github_dataset.csv imported successfully!\n');
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
 * Import repository_data.csv (large file - streaming)
 */
async function importRepositoryData() {
  console.log('\n📦 Importing repository_data.csv (this may take 10-15 minutes)...');
  
  const filePath = path.join(__dirname, '..', 'repository_data.csv');
  const fileStream = fs.createReadStream(filePath);
  
  let batch = [];
  const batchSize = 500; // Larger batches for performance
  let totalImported = 0;
  let lineCount = 0;
  
  return new Promise((resolve, reject) => {
    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: async (result, parser) => {
        lineCount++;
        
        // Transform row
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
        
        batch.push(record);
        
        // Insert batch when it reaches batchSize
        if (batch.length >= batchSize) {
          parser.pause();
          
          const { error } = await supabase
            .from('repository_data')
            .insert(batch);
          
          if (error) {
            console.error(`\n❌ Error inserting batch:`, error.message);
          } else {
            totalImported += batch.length;
            process.stdout.write(
              `\r✅ Imported: ${totalImported} rows (${Math.round((lineCount / 50000) * 100)}% estimated)`
            );
          }
          
          batch = [];
          parser.resume();
        }
      },
      complete: async () => {
        // Insert remaining records
        if (batch.length > 0) {
          const { error } = await supabase
            .from('repository_data')
            .insert(batch);
          
          if (!error) {
            totalImported += batch.length;
          }
        }
        
        console.log(`\n✅ repository_data.csv imported successfully!`);
        console.log(`📊 Total records imported: ${totalImported}\n`);
        
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
  console.log('🚀 Starting Supabase data import...');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Test connection
    const { data, error } = await supabase.from('repositories').select('count');
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    console.log('✅ Connected to Supabase successfully!\n');
    
    // Import datasets
    await importGithubDataset();
    await importRepositoryData();
    
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
