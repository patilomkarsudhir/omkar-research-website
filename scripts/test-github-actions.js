#!/usr/bin/env node

/**
 * Test script to validate the GitHub Actions setup
 * Run with: node scripts/test-github-actions.js
 */

const path = require('path');
const fs = require('fs').promises;

async function testSetup() {
  console.log('🧪 Testing GitHub Actions setup...\n');
  
  // Check if workflow file exists
  const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'update-scholar-cache.yml');
  try {
    await fs.access(workflowPath);
    console.log('✅ GitHub Actions workflow file exists');
  } catch {
    console.log('❌ GitHub Actions workflow file missing');
    console.log(`   Expected at: ${workflowPath}`);
    return;
  }
  
  // Check if update script exists
  const scriptPath = path.join(process.cwd(), 'scripts', 'update-scholar-cache.js');
  try {
    await fs.access(scriptPath);
    console.log('✅ Update script exists');
  } catch {
    console.log('❌ Update script missing');
    console.log(`   Expected at: ${scriptPath}`);
    return;
  }
  
  // Check if package.json has required dependencies
  const packagePath = path.join(process.cwd(), 'package.json');
  try {
    const packageContent = await fs.readFile(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.cheerio) {
      console.log('✅ cheerio dependency found');
    } else {
      console.log('❌ cheerio dependency missing');
      console.log('   Run: npm install cheerio');
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
  }
  
  // Check if cache file exists
  const cachePath = path.join(process.cwd(), 'data', 'scholar-cache.json');
  try {
    await fs.access(cachePath);
    console.log('✅ Existing cache file found');
  } catch {
    console.log('⚠️  Cache file doesn\'t exist yet (will be created on first run)');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Commit and push these changes to GitHub');
  console.log('2. Go to your GitHub repository → Settings → Secrets and variables → Actions');
  console.log('3. Add a new repository secret:');
  console.log('   - Name: SCHOLAR_USER');
  console.log('   - Value: EtkfNQMAAAAJ (or your Scholar user ID)');
  console.log('4. Go to Actions tab to see the workflow running');
  console.log('5. You can also trigger it manually from the Actions tab');
  
  console.log('\n🕒 The workflow will run:');
  console.log('   - Every 6 hours automatically');
  console.log('   - When you manually trigger it');
  console.log('   - When you push changes to the workflow file');
  
  console.log('\n✨ Once running, it will:');
  console.log('   - Fetch fresh Scholar data');
  console.log('   - Update data/scholar-cache.json');
  console.log('   - Commit and push changes');
  console.log('   - Trigger Vercel deployment with fresh data');
}

if (require.main === module) {
  testSetup().catch(console.error);
}
