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
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  
  if (!id || (type !== "movie" && type !== "tv")) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const key = process.env.TMDB_API_KEY;
  if (!key) {
    logger.error("Missing TMDB_API_KEY on server");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const url = `${TMDB_BASE}/${type}/${id}?language=en-US&api_key=${key}`;

  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      logger.error("TMDB details failed:", res.status, res.statusText);
      return NextResponse.json({ error: "Details fetch failed" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    logger.error("TMDB details error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
