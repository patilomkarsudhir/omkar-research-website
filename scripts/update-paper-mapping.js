#!/usr/bin/env node

/**
 * Update paper mapping with downloaded PDFs
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
    // Load scholar cache
    const cachePath = path.join(__dirname, '..', 'data', 'scholar-cache.json');
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const publications = cache.publications || [];

    // List of downloaded PDFs (from our download session)
    const downloadedPdfs = [
      'implicit-and-deep-learning-based-control-methods-for-uncertain-nonlinear-systems.pdf',
      'composite-adaptive-lyapunov-based-deep-neural-network-lb-dnn-controller.pdf',
      'lyapunov-based-graph-neural-networks-for-adaptive-control-of-multi-agent-systems.pdf',
      'adaptive-deep-neural-network-based-control-barrier-functions.pdf',
      'lyapunov-based-dropout-deep-neural-network-lb-ddnn-controller.pdf',
      'system-identification-and-control-using-lyapunov-based-deep-neural-networks-without-persistent-excit.pdf',
      'bounds-on-deep-neural-network-partial-derivatives-with-respect-to-parameters.pdf',
      'lyapunov-based-deep-neural-networks-for-adaptive-control-of-stochastic-nonlinear-systems.pdf',
      'lyla-therm-lyapunov-based-langevin-adaptive-thermodynamic-neural-network-controller.pdf',
      'distributed-rise-based-control-for-exponential-heterogeneous-multi-agent-target-tracking-of-second-o.pdf'
    ];

    // Create mapping
    const mapping = {
      "// Instructions": "Map normalized titles to PDF filenames",
      "// Format": "\"normalized-title\": \"filename.pdf\""
    };

    // Find matching publications for each PDF
    downloadedPdfs.forEach(filename => {
      const baseFilename = filename.replace('.pdf', '');
      
      // Find the publication that matches this filename
      const matchingPub = publications.find(pub => {
        const normalizedTitle = normalizeForMatching(pub.title);
        const titleSlug = normalizedTitle
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100);
        
        return baseFilename.includes(titleSlug.substring(0, 50)) || 
               titleSlug.includes(baseFilename.substring(0, 50));
      });

      if (matchingPub) {
        const key = normalizeForMatching(matchingPub.title);
        mapping[key] = filename;
        console.log(`✅ Mapped: ${matchingPub.title} -> ${filename}`);
      } else {
        console.log(`⚠️  Could not find matching publication for: ${filename}`);
      }
    });

    // Write updated mapping
    const mappingPath = path.join(__dirname, '..', 'app', 'publications', 'paper-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    
    console.log(`\n📄 Updated mapping file: ${mappingPath}`);
    console.log(`📊 Total PDFs mapped: ${Object.keys(mapping).length - 2}`); // Subtract comment entries
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
