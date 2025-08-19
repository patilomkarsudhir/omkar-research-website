export const runtime = "nodejs";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as fs from "node:fs/promises";
import * as path from "node:path";
// Statically import cache so it's bundled in the serverless function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON module
import cachedStatic from "../../../data/scholar-cache.json";

// Cache duration for both upstream fetch and CDN response (in seconds)
const REVALIDATE_SECONDS = 3600; // 1 hour

function withUA(url: string) {
  return fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
  // Let the runtime set encoding automatically
      "DNT": "1",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0"
    },
    // Next.js fetch cache to avoid hitting Scholar on every request
    next: { revalidate: REVALIDATE_SECONDS },
  });
}

function parseMetrics($: cheerio.CheerioAPI) {
  const metrics: Record<string, { all: number; recent: number }> = {};
  $("#gsc_rsb_st tbody tr").each((_, el) => {
    const cells = $(el).find("td");
    const label = $(cells[0]).text().trim().toLowerCase();
    const all = parseInt($(cells[1]).text().trim() || "0", 10);
    const recent = parseInt($(cells[2]).text().trim() || "0", 10);
    if (label) metrics[label] = { all, recent };
  });
  return metrics;
}

function isScholarLink(href?: string | null) {
  if (!href) return null;
  try {
    const u = new URL(href, "https://scholar.google.com");
    // Only allow links that resolve to scholar.google.com
    if (u.hostname.endsWith("scholar.google.com")) return u.toString();
  } catch {}
  return null;
}

function parsePubs($: cheerio.CheerioAPI) {
  const pubs: any[] = [];
  $("#gsc_a_t .gsc_a_tr").each((_, row) => {
    const t = $(row).find(".gsc_a_t a.gsc_a_at");
    const title = t.text().trim();
    const href = t.attr("href");
    const link = isScholarLink(href);
    const authors = $(row).find(".gsc_a_t .gsc_a_at+ .gs_gray").first().text().trim();
    const venue = $(row).find(".gsc_a_t .gs_gray").last().text().trim();
    const cited = parseInt($(row).find(".gsc_a_c a").text().trim() || "0", 10);
    const year = parseInt($(row).find(".gsc_a_y span").text().trim() || "0", 10);
    if (title) pubs.push({ title, link, authors, venue, cited, year });
  });
  return pubs;
}

async function loadCachedData() {
  try {
  // Prefer statically bundled cache
  if (cachedStatic) return cachedStatic as any;
  // Fallback to reading from filesystem (may not exist on all hosts)
  const filePath = path.join(process.cwd(), "data", "scholar-cache.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);
  return json;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUser =
    searchParams.get("user") ||
    process.env.SCHOLAR_USER ||
    process.env.NEXT_PUBLIC_SCHOLAR_USER ||
    "";
  // Whitelist allowed characters for Scholar user IDs to avoid SSRF in URL composition
  const user = rawUser.match(/^[A-Za-z0-9_-]+$/) ? rawUser : "";
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });
  
  const url = `https://scholar.google.com/citations?hl=en&user=${user}&cstart=0&pagesize=100`;
  
  try {
    const res = await withUA(url);
    
    if (!res.ok) {
      // Fallback to cached data instead of surfacing 5xx to clients
      const cached = await loadCachedData();
      if (cached) {
        return NextResponse.json(
          { ...cached, source: "cache", stale: true },
          { headers: { "Cache-Control": `s-maxage=${REVALIDATE_SECONDS}` } }
        );
      }
      return NextResponse.json({ error: `Fetch failed: ${res.status}` }, { status: 502 });
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    const metrics = parseMetrics($);
    const publications = parsePubs($);
    
    // Basic validation: if key containers are missing, likely blocked or markup changed
    const hasMetricsTable = $("#gsc_rsb_st").length > 0;
    const hasPubRows = $("#gsc_a_t .gsc_a_tr").length > 0;
    
    if ((!hasMetricsTable && Object.keys(metrics).length === 0) && !hasPubRows) {
      const cached = await loadCachedData();
      if (cached) {
        return NextResponse.json(
          { ...cached, source: "cache", stale: true },
          { headers: { "Cache-Control": `s-maxage=${REVALIDATE_SECONDS}` } }
        );
      }
      return NextResponse.json({ error: "Parsing failed (blocked or markup changed)" }, { status: 503 });
    }
    
    const data = { metrics, publications, source: "live", stale: false };
    return NextResponse.json(data, {
      headers: {
        // Cache at CDN to reduce origin scrapes; clients may receive stale data while we revalidate
        "Cache-Control": `s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  } catch (error) {
    console.error("Error in scholar route:", error);
    const cached = await loadCachedData();
    if (cached) {
      return NextResponse.json(
        { ...cached, source: "cache", stale: true },
        { headers: { "Cache-Control": `s-maxage=${REVALIDATE_SECONDS}` } }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
