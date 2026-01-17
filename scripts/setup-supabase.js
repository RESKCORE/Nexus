#!/usr/bin/env node

/**
 * Quick Setup Script
 * Automates Supabase setup process
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Nexus Observatory - Supabase Setup\n');

  // Check if .env.local exists
  if (fs.existsSync('.env.local')) {
    const proceed = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Skipping environment setup...');
      rl.close();
      return;
    }
  }

  console.log('\n📋 You need these from https://app.supabase.com:');
  console.log('1. Go to your project → Settings → API');
  console.log('2. Copy: Project URL, anon key, service_role key\n');

  const supabaseUrl = await question('Enter SUPABASE_URL: ');
  const anonKey = await question('Enter SUPABASE_ANON_KEY: ');
  const serviceKey = await question('Enter SUPABASE_SERVICE_ROLE_KEY: ');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error('❌ All fields are required!');
    rl.close();
    process.exit(1);
  }

  // Create .env.local
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local\n');

  // Ask if they want to run migrations
  const runMigrations = await question('🗄️  Run database migrations now? (Y/n): ');
  if (runMigrations.toLowerCase() !== 'n') {
    console.log('\n📊 Pushing migrations to Supabase...');
    try {
      exec('npx supabase db push');
      console.log('✅ Migrations complete!\n');
    } catch (error) {
      console.error('❌ Migration failed. You can run manually: npm run supabase:push');
    }
  }

  // Ask if they want to import data
  const importData = await question('📥 Import CSV data now? (takes 10-15 min) (Y/n): ');
  if (importData.toLowerCase() !== 'n') {
    console.log('\n⏳ Starting data import (this will take a while)...');
    try {
      exec('npm run import:data');
      console.log('✅ Data import complete!\n');
    } catch (error) {
      console.error('❌ Import failed. You can run manually: npm run import:data');
    }
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n📚 Next steps:');
  console.log('1. npm run dev          - Start dev server');
  console.log('2. Open http://localhost:3000/api/stats');
  console.log('3. Check SUPABASE_SETUP.md for full docs\n');

  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
