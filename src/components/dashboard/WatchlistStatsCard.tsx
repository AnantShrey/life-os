"use client";

export function WatchlistStatsCard({ items }: { items: any[] }) {
  const stats = [
    { label: "Movies", val: items.filter(i => i.media_type === "movie").length, icon: "🎬" },
    { label: "TV Shows", val: items.filter(i => i.media_type === "tv").length, icon: "📺" },
    { label: "Watched", val: items.filter(i => i.status === "watched").length, icon: "✅" },
    { label: "To Watch", val: items.filter(i => i.status === "want").length, icon: "⏳" },
  ];

  return (
    <div className="bento-card h-full">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 h-full content-center">
        {stats.map(s => (
          <div key={s.label} className="flex flex-col">
            <span className="text-[14px] mb-1">{s.icon}</span>
            <span className="text-2xl font-bold leading-none">{s.val}</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
