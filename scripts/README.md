# Scripts

This directory contains utility scripts for maintaining the website.

## update-scholar-cache.js

Updates the `data/scholar-cache.json` file with fresh data from Google Scholar.

### Usage

```bash
# Using npm script (recommended)
npm run update-scholar

# Or directly with node
node scripts/update-scholar-cache.js

# With custom Scholar user ID
node scripts/update-scholar-cache.js YOUR_SCHOLAR_ID
```

### What it does

1. Fetches your latest publications and metrics from Google Scholar
2. Updates the local `data/scholar-cache.json` file
3. Provides a summary of the updated data
4. Gives you next steps to commit the changes

### When to run

- **After publishing new papers** - to ensure your website shows the latest publications
- **Periodically** - to keep citation counts and metrics current (weekly/monthly)
- **Before deployments** - to ensure the cache is fresh for the website fallback

### Example output

```
🔄 Updating Scholar cache for user: EtkfNQMAAAAJ
📅 Timestamp: 2025-08-27T10:30:00.000Z

Fetching data from: https://scholar.google.com/citations?hl=en&user=EtkfNQMAAAAJ&cstart=0&pagesize=100
✓ Found 3 metrics and 37 publications

📊 Data Summary:
   Citations: 403 (401 recent)
   h-index: 11 (11 recent)
   i10-index: 11 (11 recent)
   Publications: 37

Writing to: /path/to/data/scholar-cache.json
✓ Cache file updated successfully

✅ Scholar cache updated successfully!

💡 Next steps:
   1. Review the changes: git diff data/scholar-cache.json
   2. Commit the changes: git add data/scholar-cache.json && git commit -m "chore: update scholar cache"
   3. Push to GitHub: git push
```

### Troubleshooting

If you get blocked by Google Scholar:
- Wait a few minutes and try again
- Consider using a VPN
- Run the script less frequently
- The script uses proper headers to minimize blocking

### Automation

You could set up a scheduled task or cron job to run this automatically:

**Windows Task Scheduler:**
- Run weekly: `npm run update-scholar` in your project directory

**macOS/Linux cron:**
```bash
# Run every Sunday at 9 AM
0 9 * * 0 cd /path/to/project && npm run update-scholar
```
