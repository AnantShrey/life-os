import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  current_page?: number | null;
  page_count?: number | null;
  status: string;
};

function BookCover({ book }: { book: Book }) {
  const colors = [
    "bg-sky-400", "bg-violet-400", "bg-rose-400",
    "bg-amber-400", "bg-emerald-400", "bg-indigo-400",
  ];
  const colorIdx = book.title.charCodeAt(0) % colors.length;

  return (
    <div
      className="relative flex-shrink-0 rounded-[8px] overflow-hidden"
      style={{
        width: 64,
        height: 96,
        boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
      }}
    >
      {book.cover_url ? (
        <Image
          src={book.cover_url}
          alt={book.title}
          fill
          className="object-cover"
          sizes="64px"
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full ${colors[colorIdx]} flex items-center justify-center text-white text-2xl font-bold`}
        >
          {book.title.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function BookProgressCard({ book }: { book: Book }) {
  const pct =
    book.page_count && book.current_page
      ? Math.min(100, Math.round((book.current_page / book.page_count) * 100))
      : 0;

  return (
    <div className="flex gap-4 min-w-[200px] max-w-[280px] bg-muted/30 rounded-[14px] p-3">
      <BookCover book={book} />
      <div className="flex flex-col justify-between min-w-0 flex-1">
        <div>
          <h4 className="font-semibold text-sm leading-tight line-clamp-2">{book.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        </div>
        {book.page_count ? (
          <div className="mt-2">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Page {book.current_page || 0} of {book.page_count} ({pct}%)
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CurrentlyReadingCard({ books }: { books: Book[] }) {
  const reading = books.filter((b) => b.status === "reading");

  return (
    <div className="bento-card flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">Currently Reading</h2>
      </div>

      {reading.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2 text-center">
          <span className="text-3xl">📚</span>
          <Link href="/books" className="text-sm text-primary hover:underline font-medium">
            Add a book to start reading →
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {reading.map((b) => (
            <BookProgressCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
