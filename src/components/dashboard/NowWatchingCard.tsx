"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

export function NowWatchingCard({ items }: { items: any[] }) {
  const watching = items.filter(i => i.status === "watching").slice(0, 3);

  return (
    <div className="bento-card h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 text-primary fill-primary" />
        <h3 className="font-bold text-sm">Now Watching</h3>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {watching.length > 0 ? watching.map(item => (
          <div key={item.id} className="flex gap-3 items-center">
            <div className="relative w-11 h-16 rounded-[8px] overflow-hidden flex-shrink-0 bg-muted shadow-sm">
              {item.poster_path ? (
                <Image src={item.poster_path} alt={item.title} fill className="object-cover" sizes="44px" />
              ) : <div className="w-full h-full flex items-center justify-center text-[10px]">🎬</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {item.media_type === "tv" ? "TV" : "Movie"}
                </span>
                {item.media_type === "tv" && (
                  <span className="text-[10px] text-primary font-medium">S{item.current_season} E{item.current_episode}</span>
                )}
              </div>
              <div className="text-[10px] text-amber-500 font-bold mt-0.5">⭐ {item.tmdb_rating || "—"}</div>
            </div>
          </div>
        )) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-xs text-muted-foreground italic">Nothing in progress</p>
            <Link href="/watchlist" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
              Start watching →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
