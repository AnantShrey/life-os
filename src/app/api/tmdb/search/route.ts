import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request: Request) {
  // Enforce authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const key = process.env.TMDB_API_KEY;
  if (!key) {
    logger.error("Missing TMDB_API_KEY on server");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const url = `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${key}&include_adult=false&language=en-US&page=1`;

  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      logger.error("TMDB search failed:", res.status, res.statusText);
      return NextResponse.json({ error: "Search failed" }, { status: res.status });
    }
    const data = await res.json();
    
    // Filter results before sending to client
    const filtered = (data.results || []).filter((r: any) =>
      (r.media_type === "movie" || r.media_type === "tv") && (r.poster_path || r.title || r.name)
    );
    
    return NextResponse.json({ results: filtered });
  } catch (err) {
    logger.error("TMDB search error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
