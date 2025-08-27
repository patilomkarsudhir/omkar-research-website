#!/usr/bin/env node

/**
 * Script to update scholar-cache.json with fresh data from Google Scholar
 * Run with: node scripts/update-scholar-cache.js
 * Or with Scholar ID: node scripts/update-scholar-cache.js EtkfNQMAAAAJ
 */

const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

// Default Scholar user ID (can be overridden via command line)
const DEFAULT_USER_ID = 'EtkfNQMAAAAJ';

/**
 * Fetch URL with proper headers to avoid blocking
 */
function fetchWithUA(url) {
  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    },
    cache: 'no-store'
  });
}

/**
 * Parse metrics from Scholar page
 */
function parseMetrics($) {
  const metrics = {};
  $('#gsc_rsb_st tbody tr').each((_, el) => {
    const cells = $(el).find('td');
    const label = $(cells[0]).text().trim().toLowerCase();
    const all = parseInt($(cells[1]).text().trim() || '0', 10);
    const recent = parseInt($(cells[2]).text().trim() || '0', 10);
    if (label) {
      metrics[label] = { all, recent };
    }
  });
  return metrics;
}

/**
 * Check if a link is a valid Scholar link
 */
function isScholarLink(href) {
  if (!href) return null;
  try {
    const u = new URL(href, 'https://scholar.google.com');
    if (u.hostname.endsWith('scholar.google.com')) {
      return u.toString();
    }
  } catch (e) {
    // Invalid URL
  }
  return null;
}

/**
 * Parse publications from Scholar page
 */
function parsePublications($) {
  const publications = [];
  $('#gsc_a_t .gsc_a_tr').each((_, row) => {
    const titleElement = $(row).find('.gsc_a_t a.gsc_a_at');
    const title = titleElement.text().trim();
    const href = titleElement.attr('href');
    const link = isScholarLink(href);
    const authors = $(row).find('.gsc_a_t .gsc_a_at+ .gs_gray').first().text().trim();
    const venue = $(row).find('.gsc_a_t .gs_gray').last().text().trim();
    const cited = parseInt($(row).find('.gsc_a_c a').text().trim() || '0', 10);
    const year = parseInt($(row).find('.gsc_a_y span').text().trim() || '0', 10);
    
    if (title) {
      publications.push({
        title,
        link,
        authors,
        venue,
        cited,
        year
      });
    }
  });
  return publications;
}

/**
 * Fetch fresh data from Google Scholar with retry logic
 */
async function fetchScholarData(userId, maxRetries = 3) {
  const url = `https://scholar.google.com/citations?hl=en&user=${userId}&cstart=0&pagesize=100`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching data from: ${url} (attempt ${attempt}/${maxRetries})`);
      
      const response = await fetchWithUA(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Parse data
      const metrics = parseMetrics($);
      const publications = parsePublications($);
      
      // Validate that we got meaningful data
      const hasMetricsTable = $('#gsc_rsb_st').length > 0;
      const hasPubRows = $('#gsc_a_t .gsc_a_tr').length > 0;
      
      if (!hasMetricsTable && Object.keys(metrics).length === 0 && !hasPubRows) {
        throw new Error('Failed to parse Scholar data - may be blocked or page structure changed');
      }
      
      console.log(`✓ Found ${Object.keys(metrics).length} metrics and ${publications.length} publications`);
      
      return {
        metrics,
        publications,
        source: 'live-script',
        stale: false,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Re-throw on final attempt
      }
    }
  }
}

/**
 * Update the local cache file
 */
async function updateCacheFile(data) {
  const cacheFilePath = path.join(process.cwd(), 'data', 'scholar-cache.json');
  
  console.log(`Writing to: ${cacheFilePath}`);
  
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(cacheFilePath);
  await fs.mkdir(dataDir, { recursive: true });
  
  // Write the file with pretty formatting
  await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log('✓ Cache file updated successfully');
}

/**
 * Main function
 */
async function main() {
  try {
    // Get user ID from command line args, environment variable, or use default
    const userId = process.argv[2] || process.env.SCHOLAR_USER || DEFAULT_USER_ID;
    
    if (!userId.match(/^[A-Za-z0-9_-]+$/)) {
      throw new Error('Invalid Scholar user ID format');
    }
    
    console.log(`🔄 Updating Scholar cache for user: ${userId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log('');
    
    // Fetch fresh data
    const data = await fetchScholarData(userId);
    
    // Show summary
    console.log('');
    console.log('📊 Data Summary:');
    if (data.metrics.citations) {
      console.log(`   Citations: ${data.metrics.citations.all} (${data.metrics.citations.recent} recent)`);
    }
    if (data.metrics['h-index']) {
      console.log(`   h-index: ${data.metrics['h-index'].all} (${data.metrics['h-index'].recent} recent)`);
    }
    if (data.metrics['i10-index']) {
      console.log(`   i10-index: ${data.metrics['i10-index'].all} (${data.metrics['i10-index'].recent} recent)`);
    }
    console.log(`   Publications: ${data.publications.length}`);
    console.log('');
    
    // Update cache file
    await updateCacheFile(data);
    
    console.log('');
    console.log('✅ Scholar cache updated successfully!');
    
    // Only show git instructions if not in CI environment
    if (!process.env.CI) {
      console.log('');
      console.log('💡 Next steps:');
      console.log('   1. Review the changes: git diff data/scholar-cache.json');
      console.log('   2. Commit the changes: git add data/scholar-cache.json && git commit -m "chore: update scholar cache"');
      console.log('   3. Push to GitHub: git push');
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ Error updating Scholar cache:');
    console.error(`   ${error.message}`);
    console.error('');
    
    if (error.message.includes('blocked')) {
      console.error('💡 Tips to avoid blocking:');
      console.error('   - Wait a few minutes and try again');
      console.error('   - Try using a VPN');
      console.error('   - Run the script less frequently');
      console.error('');
      console.error('ℹ️  The existing cache will remain unchanged');
    }
    
    // In CI environment, don't exit with error to avoid breaking the workflow
    // Just log the error and continue - the cache will remain stale but functional
    if (process.env.CI) {
      console.error('⚠️  Running in CI - continuing with existing cache');
      return;
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchScholarData, updateCacheFile };
