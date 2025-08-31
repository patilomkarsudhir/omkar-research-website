#!/usr/bin/env node

/**
 * Interactive PDF mapping tool
 * This script will help map each publication to available PDF files
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

function normalizeForFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

// Function to find best matching PDF for a publication
function findBestMatch(pubTitle, pdfFiles) {
  const normalizedPub = normalizeForMatching(pubTitle);
  const pubWords = normalizedPub.split(' ').filter(w => w.length > 2); // Only words with 3+ chars
  
  let bestMatch = null;
  let bestScore = 0;
  
  pdfFiles.forEach(pdfFile => {
    const normalizedPdf = normalizeForMatching(pdfFile.replace('.pdf', ''));
    const pdfWords = normalizedPdf.split(/[-_\s]+/).filter(w => w.length > 2);
    
    // Calculate match score based on word overlap
    let score = 0;
    pubWords.forEach(pubWord => {
      if (pdfWords.some(pdfWord => 
        pdfWord.includes(pubWord) || pubWord.includes(pdfWord) ||
        (pubWord.length > 4 && pdfWord.length > 4 && 
         (pubWord.substring(0, 4) === pdfWord.substring(0, 4)))
      )) {
        score++;
      }
    });
    
    // Normalize score by publication word count
    const normalizedScore = score / pubWords.length;
    
    if (normalizedScore > bestScore && normalizedScore > 0.3) { // At least 30% match
      bestScore = normalizedScore;
      bestMatch = { file: pdfFile, score: normalizedScore };
    }
  });
  
  return bestMatch;
}

async function main() {
  try {
    // Load scholar cache and current mapping
    const cachePath = path.join(__dirname, '..', 'data', 'scholar-cache.json');
    const mappingPath = path.join(__dirname, '..', 'app', 'publications', 'paper-mapping.json');
    const papersDir = path.join(__dirname, '..', 'app', 'publications', 'papers');
    
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const currentMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const pdfFiles = fs.readdirSync(papersDir).filter(f => f.endsWith('.pdf'));
    
    const publications = cache.publications || [];
    
    console.log('🔗 Auto-Mapping Publications to PDFs');
    console.log('=====================================\n');
    console.log(`Found ${publications.length} publications and ${pdfFiles.length} PDF files\n`);
    
    const newMapping = {
      "// Instructions": "Map normalized titles to PDF filenames",
      "// Format": "\"normalized-title\": \"filename.pdf\""
    };
    
    let mappedCount = 0;
    let autoMappedCount = 0;
    
    publications.forEach((pub, index) => {
      const normalizedTitle = normalizeForMatching(pub.title);
      
      // Check if already mapped
      if (currentMapping[normalizedTitle]) {
        newMapping[normalizedTitle] = currentMapping[normalizedTitle];
        mappedCount++;
        console.log(`✅ ${index + 1}. ${pub.title}`);
        console.log(`   📄 Already mapped: ${currentMapping[normalizedTitle]}`);
        console.log('');
        return;
      }
      
      // Try to find best match
      const bestMatch = findBestMatch(pub.title, pdfFiles);
      
      if (bestMatch && bestMatch.score > 0.5) { // High confidence match
        newMapping[normalizedTitle] = bestMatch.file;
        mappedCount++;
        autoMappedCount++;
        console.log(`🔄 ${index + 1}. ${pub.title}`);
        console.log(`   📄 Auto-mapped: ${bestMatch.file} (confidence: ${(bestMatch.score * 100).toFixed(1)}%)`);
        console.log('');
      } else if (bestMatch) {
        console.log(`❓ ${index + 1}. ${pub.title}`);
        console.log(`   🤔 Possible match: ${bestMatch.file} (confidence: ${(bestMatch.score * 100).toFixed(1)}%)`);
        console.log(`   ⏭️  Skipping low confidence match`);
        console.log('');
      } else {
        console.log(`❌ ${index + 1}. ${pub.title}`);
        console.log(`   📄 No matching PDF found`);
        console.log('');
      }
    });
    
    // Write updated mapping
    fs.writeFileSync(mappingPath, JSON.stringify(newMapping, null, 2));
    
    console.log('\n📊 Auto-Mapping Results:');
    console.log(`   Total publications: ${publications.length}`);
    console.log(`   Total mapped: ${mappedCount}`);
    console.log(`   Auto-mapped this run: ${autoMappedCount}`);
    console.log(`   Coverage: ${((mappedCount / publications.length) * 100).toFixed(1)}%`);
    
    console.log('\n💡 Next steps:');
    console.log('1. Review the auto-mappings above');
    console.log('2. For missed mappings, manually add entries to paper-mapping.json');
    console.log('3. Run the test script to verify: node scripts/test-pdf-mapping.js');
    
    // Show unmapped PDFs
    const mappedPdfs = Object.values(newMapping).filter(v => typeof v === 'string');
    const unmappedPdfs = pdfFiles.filter(pdf => !mappedPdfs.includes(pdf));
    
    if (unmappedPdfs.length > 0) {
      console.log('\n📋 Unmapped PDF files:');
      unmappedPdfs.forEach(pdf => {
        console.log(`   - ${pdf}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
