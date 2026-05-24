const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
export const TMDB_THUMB_BASE = "https://image.tmdb.org/t/p/w200";

function getHeaders() {
  return { "Content-Type": "application/json" };
}

export async function searchTMDB(query: string, signal?: AbortSignal) {
  if (!query.trim() || query.length < 2) return [];
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${key}&include_adult=false&language=en-US&page=1`;
  
  try {
    const res = await fetch(url, { headers: getHeaders(), signal }); // pass signal here
    if (!res.ok) {
      console.error("TMDB search failed:", res.status, res.statusText);
      throw new Error("Search failed");
    }
    const data = await res.json();
    return (data.results || []).filter((r: any) =>
      (r.media_type === "movie" || r.media_type === "tv") && (r.poster_path || r.title || r.name)
    );
  } catch (err) {
    console.error("TMDB search error:", err);
    throw err;
  }
}

export async function getTMDBDetails(id: number, type: "movie" | "tv") {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = `${TMDB_BASE}/${type}/${id}?language=en-US&api_key=${key}`;
  
  try {
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      console.error("TMDB details failed:", res.status, res.statusText);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("TMDB details error:", err);
    return null;
  }
}

export function mapTMDBResult(item: any) {
  const isTV = item.media_type === "tv" || item.first_air_date;
  return {
    tmdb_id: item.id,
    media_type: (isTV ? "tv" : "movie") as "movie" | "tv",
    title: item.title || item.name || "Unknown",
    poster_path: item.poster_path ? `${TMDB_THUMB_BASE}${item.poster_path}` : null,
    backdrop_path: item.backdrop_path ? `${TMDB_IMAGE_BASE}${item.backdrop_path}` : null,
    overview: item.overview || "",
    release_year: parseInt(
      (item.release_date || item.first_air_date || "0").substring(0, 4)
    ) || null,
    genres: (item.genres || []).map((g: any) => g.name) as string[],
    tmdb_rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    runtime: item.runtime || item.episode_run_time?.[0] || null,
    total_seasons: item.number_of_seasons || null,
    total_episodes: item.number_of_episodes || null,
  };
}
