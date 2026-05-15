import { BarChart2 } from "lucide-react";

type Book = {
  id: string;
  status: string;
  finished_at?: string | null;
  created_at?: string | null;
};

export function ReadingStatsCard({ books }: { books: Book[] }) {
  const currentYear = new Date().getFullYear();

  const totalFinished = books.filter((b) => b.status === "finished").length;
  const finishedThisYear = books.filter((b) => {
    if (b.status !== "finished") return false;
    const dateStr = b.finished_at || b.created_at;
    if (!dateStr) return false;
    return new Date(dateStr).getFullYear() === currentYear;
  }).length;
  const totalInLibrary = books.length;
  const wishlisted = books.filter((b) => b.status === "want").length;

  const stats = [
    { emoji: "📚", value: totalFinished, label: "books finished" },
    { emoji: "📅", value: finishedThisYear, label: `finished in ${currentYear}` },
    { emoji: "📖", value: totalInLibrary, label: "books in library" },
    { emoji: "🔖", value: wishlisted, label: "wishlisted" },
  ];

  return (
    <div className="bento-card flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">Reading Stats</h2>
      </div>

      <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-border/50 rounded-[14px] overflow-hidden border border-border/50">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-5 gap-1">
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-[36px] font-bold leading-none text-primary">{s.value}</span>
            <span className="text-[13px] text-muted-foreground text-center leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
