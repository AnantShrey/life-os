import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  status: string;
};

const PLACEHOLDER_COLORS = [
  "bg-sky-400", "bg-violet-400", "bg-rose-400",
  "bg-amber-400", "bg-emerald-400", "bg-indigo-400",
];

export function WishlistPreviewCard({ books }: { books: Book[] }) {
  const wishlist = books.filter((b) => b.status === "want");
  const preview = wishlist.slice(0, 3);
  const extra = wishlist.length - 3;

  return (
    <div className="bento-card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">Want to Read</h2>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-6 gap-2 text-center">
          <span className="text-2xl">🔖</span>
          <Link href="/books" className="text-sm text-primary hover:underline">
            Your library is empty — add a book →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {preview.map((b) => {
              const colorIdx = b.title.charCodeAt(0) % PLACEHOLDER_COLORS.length;
              return (
                <div key={b.id} className="flex items-center gap-3 group">
                  <div
                    className="relative rounded-[6px] overflow-hidden flex-shrink-0"
                    style={{ width: 36, height: 52 }}
                  >
                    {b.cover_url ? (
                      <Image
                        src={b.cover_url}
                        alt={b.title}
                        fill
                        className="object-cover"
                        sizes="36px"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${PLACEHOLDER_COLORS[colorIdx]} flex items-center justify-center text-white text-sm font-bold`}
                      >
                        {b.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {b.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground truncate">{b.author}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {extra > 0 && (
            <Link
              href="/books"
              className="inline-flex self-start items-center text-xs font-medium bg-muted hover:bg-muted/80 px-4 py-1.5 rounded-full transition-colors"
            >
              + {extra} more
            </Link>
          )}
        </>
      )}
    </div>
  );
}
