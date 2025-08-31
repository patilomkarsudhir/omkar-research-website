#!/usr/bin/env node

/**
 * Test script to verify PDF mapping works correctly
 */

const fs = require('fs');
const path = require('path');

function normalizeForMatching(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  try {
    // Load scholar cache and paper mapping
    const cachePath = path.join(__dirname, '..', 'data', 'scholar-cache.json');
    const mappingPath = path.join(__dirname, '..', 'app', 'publications', 'paper-mapping.json');
    
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    const publications = cache.publications || [];
    
    console.log('🔍 Testing PDF Mapping:');
    console.log('=======================\n');
    
    let mappedCount = 0;
    let totalCount = 0;
    
    publications.forEach((pub, index) => {
      totalCount++;
      const normalizedTitle = normalizeForMatching(pub.title);
      const filename = mapping[normalizedTitle];
      
      if (filename) {
        mappedCount++;
        const pdfPath = path.join(__dirname, '..', 'public', 'publications', 'papers', filename);
        const exists = fs.existsSync(pdfPath);
        
        console.log(`✅ ${index + 1}. ${pub.title}`);
        console.log(`   📄 PDF: ${filename} ${exists ? '(EXISTS)' : '(MISSING FILE)'}`);
        console.log('');
      }
    });
    
    console.log(`📊 Summary:`);
    console.log(`   Total publications: ${totalCount}`);
    console.log(`   Publications with PDFs: ${mappedCount}`);
    console.log(`   Coverage: ${((mappedCount / totalCount) * 100).toFixed(1)}%`);
    
    if (mappedCount > 0) {
      console.log('\n🎉 PDF integration is working!');
      console.log('Visit http://localhost:3000/publications to see the "View PDF" buttons');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
