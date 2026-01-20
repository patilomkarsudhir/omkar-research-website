export const runtime = "nodejs";
import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";
// Statically import cache so it's bundled in the serverless function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON module
import cachedStatic from "../../../data/scholar-cache.json";

// Cache duration for CDN responses. This route intentionally does NOT scrape Google Scholar.
const CACHE_SECONDS = 6 * 60 * 60; // 6 hours

async function loadCachedData() {
  try {
    // Prefer reading from filesystem (works in local dev); fall back to bundled cache.
    const filePath = path.join(process.cwd(), "data", "scholar-cache.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    try {
      return cachedStatic as any;
    } catch {
      return null;
    }
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

  const cached = await loadCachedData();
  if (!cached) {
    return NextResponse.json({ error: "Cached scholar data unavailable" }, { status: 503 });
  }

  return NextResponse.json(
    { ...cached, source: "cache", stale: true },
    { headers: { "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate` } }
  );
}
