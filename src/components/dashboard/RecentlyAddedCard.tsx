"use client";

import Image from "next/image";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  want: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  watching: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  watched: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
};

export function RecentlyAddedCard({ items }: { items: any[] }) {
  const recent = items.slice(0, 4);

  return (
    <div className="bento-card h-full flex flex-col gap-4">
      <h3 className="font-bold text-sm">Recently Added</h3>
      
      <div className="flex flex-col gap-3 flex-1">
        {recent.map(item => (
          <div key={item.id} className="flex gap-3 items-center">
            <div className="relative w-9 h-13 rounded-[6px] overflow-hidden flex-shrink-0 bg-muted shadow-sm">
              {item.poster_path ? (
                <Image src={item.poster_path} alt={item.title} fill className="object-cover" sizes="36px" />
              ) : <div className="w-full h-full flex items-center justify-center text-[8px]">🎬</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] truncate">{item.title}</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-muted-foreground">{item.release_year}</span>
                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                  {item.status === 'want' ? 'Want' : item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-xs text-muted-foreground italic">No titles added yet</p>
          </div>
        )}
      </div>

      <Link href="/watchlist" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest mt-auto pt-2 border-t border-border/50">
        View all →
      </Link>
    </div>
  );
}
