/**
 * Generate SQL for Stats Cache Migration
 * Outputs the SQL you need to run in Supabase SQL Editor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n📊 SUPABASE SQL MIGRATION\n');
console.log('Copy the SQL below and paste it into your Supabase SQL Editor:\n');
console.log('─'.repeat(80));
console.log('\n');

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260117000003_create_stats_cache.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log(sql);

console.log('\n');
console.log('─'.repeat(80));
console.log('\n✅ Steps:\n');
console.log('1. Open: https://supabase.com/dashboard → Your Project → SQL Editor');
console.log('2. Create a "New Query"');
console.log('3. Copy the SQL above');
console.log('4. Paste and click "Run" (or Ctrl+Enter)');
console.log('5. Verify with: SELECT * FROM dashboard_stats_cache;\n');
console.log('6. Restart your dev server: npm run dev\n');
