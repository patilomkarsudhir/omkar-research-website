import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface VisitorData {
  totalVisitors: number;
  uniqueVisitors: number;
  currentOnline: number;
  lastUpdated: string;
  sessions: {
    [sessionId: string]: {
      ip: string;
      timestamp: number;
      lastSeen: number;
    };
  };
}

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json');
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function ensureAnalyticsFile(): VisitorData {
  try {
    if (!fs.existsSync(path.dirname(ANALYTICS_FILE))) {
      fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
    }
    
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('Error reading analytics file:', error);
  }
  
  // Return default data if file doesn't exist or is corrupted
  return {
    totalVisitors: 0,
    uniqueVisitors: 0,
    currentOnline: 0,
    lastUpdated: new Date().toISOString(),
    sessions: {}
  };
}

function saveAnalyticsData(data: VisitorData) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving analytics file:', error);
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function isBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Common bot patterns
  const botPatterns = [
    // Search engine crawlers
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
    'facebookexternalhit', 'twitterbot', 'rogerbot', 'linkedinbot', 'embedly',
    'quora link preview', 'showyoubot', 'outbrain', 'pinterest/0.',
    'developers.google.com/+/web/snippet', 'slackbot', 'vkshare', 'w3c_validator',
    'redditbot', 'applebot', 'whatsapp', 'flipboard', 'tumblr', 'bitlybot',
    'skypeuripreview', 'nuzzel', 'discordbot', 'google page speed',
    'qwantify', 'pinterestbot', 'bitrix link preview', 'xing-contenttabreceiver',
    'chrome-lighthouse', 'telegrambot',
    
    // Generic bot indicators
    'bot', 'crawler', 'spider', 'scraper', 'fetcher', 'validator',
    'monitoring', 'uptime', 'pingdom', 'nagios', 'check_http',
    'wget', 'curl', 'httpclient', 'python-requests', 'python-urllib',
    'java/', 'apache-httpclient', 'okhttp', 'axios',
    
    // Headless browsers often used by bots
    'headlesschrome', 'phantomjs', 'slimerjs', 'htmlunit',
    
    // SEO tools
    'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'gigabot',
    'ia_archiver', 'archive.org_bot', 'wayback', 'screaming frog',
    
    // Security scanners
    'nessus', 'openvas', 'nikto', 'w3af', 'skipfish', 'sqlmap',
    'nmap', 'masscan', 'zap', 'burp', 'acunetix'
  ];
  
  // Check if user agent contains any bot patterns
  const haseBotPattern = botPatterns.some(pattern => userAgent.includes(pattern));
  
  // Check for missing or suspicious user agents
  const isSuspiciousUA = !userAgent || 
                        userAgent.length < 10 || 
                        userAgent === 'mozilla/5.0' ||
                        userAgent.startsWith('curl/') ||
                        userAgent.startsWith('wget/');
  
  // Check for programmatic indicators
  const hasProgrammaticHeaders = request.headers.get('x-requested-with') === 'xmlhttprequest' && 
                                !request.headers.get('referer');
  
  return haseBotPattern || isSuspiciousUA || hasProgrammaticHeaders;
}

function cleanExpiredSessions(data: VisitorData): VisitorData {
  const now = Date.now();
  const validSessions: typeof data.sessions = {};
  
  Object.entries(data.sessions).forEach(([sessionId, session]) => {
    if (now - session.lastSeen < SESSION_TIMEOUT) {
      validSessions[sessionId] = session;
    }
  });
  
  return {
    ...data,
    sessions: validSessions,
    currentOnline: Object.keys(validSessions).length
  };
}

export async function GET() {
  try {
    let data = ensureAnalyticsFile();
    data = cleanExpiredSessions(data);
    
    return NextResponse.json({
      totalVisitors: data.totalVisitors,
      uniqueVisitors: data.uniqueVisitors,
      currentOnline: data.currentOnline,
      lastUpdated: data.lastUpdated
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if request is from a bot
    if (isBot(request)) {
      return NextResponse.json({
        totalVisitors: 0,
        uniqueVisitors: 0,
        currentOnline: 0,
        lastUpdated: new Date().toISOString(),
        isBot: true
      });
    }

    const { sessionId } = await request.json();
    const clientIP = getClientIP(request);
    const now = Date.now();
    
    let data = ensureAnalyticsFile();
    data = cleanExpiredSessions(data);
    
    // Check if this is a new session
    const isNewSession = !data.sessions[sessionId];
    const isNewIP = !Object.values(data.sessions).some(session => session.ip === clientIP);
    
    // Update or create session
    data.sessions[sessionId] = {
      ip: clientIP,
      timestamp: data.sessions[sessionId]?.timestamp || now,
      lastSeen: now
    };
    
    // Update counters
    if (isNewSession) {
      data.totalVisitors++;
      if (isNewIP) {
        data.uniqueVisitors++;
      }
    }
    
    data.currentOnline = Object.keys(data.sessions).length;
    data.lastUpdated = new Date().toISOString();
    
    saveAnalyticsData(data);
    
    return NextResponse.json({
      totalVisitors: data.totalVisitors,
      uniqueVisitors: data.uniqueVisitors,
      currentOnline: data.currentOnline,
      lastUpdated: data.lastUpdated,
      isNewSession
    });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}
