"use client";

import { useState, useTransition, useEffect } from "react";
import { searchGoogleBooks, addBook, updateBookStatus, updateBookRating, deleteBook, addBookPages, toggleBookPause } from "./actions";
import { Search, Plus, Book, Star, Trash2, Pause, Play, TrendingUp, Clock, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function BookSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const data = await searchGoogleBooks(query);
    setResults(data);
    setIsSearching(false);
  };

  const handleAdd = (book: any) => {
    startTransition(async () => {
      const res = await addBook(book);
      if (res && !res.success) {
        toast.error(res.error || "Failed to add book");
      } else {
        toast.success("Added to library");
        setResults(results.filter(r => r.google_books_id !== book.google_books_id));
      }
    });
  };

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
      <h3 className="font-semibold text-lg mb-4">Add a new book</h3>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full bg-background pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          {results.map((book) => (
            <div key={book.google_books_id} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-background">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-20 h-28 object-cover rounded shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-20 h-28 bg-muted flex items-center justify-center rounded border border-border flex-shrink-0">
                  <Book className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h4 className="font-semibold text-base line-clamp-1">{book.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
                  {book.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    {book.page_count ? `${book.page_count} pages` : "Unknown pages"}
                  </span>
                  <button
                    onClick={() => handleAdd(book)}
                    disabled={isPending}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded hover:bg-secondary/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add to Library
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookCard({ book }: { book: any }) {
  const [isPending, startTransition] = useTransition();
  const [pagesToAdd, setPagesToAdd] = useState("");
  // local refresh for elapsed time
  const [now, setNow] = useState(Date.now());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (book.status === "reading" && !book.is_paused) {
      const interval = setInterval(() => setNow(Date.now()), 60000); // update every minute
      return () => clearInterval(interval);
    }
  }, [book.status, book.is_paused]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(async () => {
      const res = await updateBookStatus(book.id, e.target.value);
      if (res && !res.success) toast.error(res.error || "Failed to update status");
    });
  };

  const handleAddPages = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pagesToAdd);
    if (val > 0) {
      startTransition(async () => {
        const res = await addBookPages(book.id, val);
        if (res && !res.success) toast.error(res.error || "Failed to log pages");
        else {
          toast.success("Pages logged");
          setPagesToAdd("");
        }
      });
    }
  };

  const handleTogglePause = () => {
    startTransition(async () => {
      const res = await toggleBookPause(book.id, !book.is_paused);
      if (res && !res.success) toast.error(res.error || "Failed to toggle pause");
    });
  };

  const handleRating = (rating: number) => {
    startTransition(async () => {
      const res = await updateBookRating(book.id, rating);
      if (res && !res.success) toast.error(res.error || "Failed to update rating");
    });
  };

  const executeDelete = () => {
    startTransition(async () => {
      const res = await deleteBook(book.id);
      if (res && !res.success) toast.error(res.error || "Failed to delete book");
      else toast.success("Book deleted");
    });
  };

  const getReadingStats = () => {
    if (book.status !== "reading" || !book.started_reading_at) return null;

    let totalMs = Number(book.total_reading_time_ms || 0);
    if (!book.is_paused && book.last_resumed_at) {
      totalMs += now - new Date(book.last_resumed_at).getTime();
    }

    // Convert to days, minimum 1 day if started today
    const daysSinceStarted = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
    const pagesPerDay = book.current_page ? (book.current_page / daysSinceStarted).toFixed(1) : 0;

    let estimatedDaysLeft = null;
    if (book.page_count && book.current_page && Number(pagesPerDay) > 0) {
      estimatedDaysLeft = Math.ceil((book.page_count - book.current_page) / Number(pagesPerDay));
    }

    return { daysSinceStarted, pagesPerDay, estimatedDaysLeft };
  };

  const stats = getReadingStats();

  return (
    <div className="flex flex-col sm:flex-row gap-5 p-5 border border-border rounded-xl bg-card shadow-sm group">
      {/* Cover Image */}
      <div className="flex-shrink-0 relative">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-28 h-40 sm:w-32 sm:h-48 object-cover rounded shadow-md" />
        ) : (
          <div className="w-28 h-40 sm:w-32 sm:h-48 bg-muted flex items-center justify-center rounded shadow-md border border-border">
            <Book className="w-10 h-10 text-muted-foreground" />
          </div>
        )}

        {book.status === "reading" && (
          <button
            onClick={handleTogglePause}
            disabled={isPending}
            title={book.is_paused ? "Resume reading time" : "Pause reading time"}
            className={`absolute -bottom-3 -right-3 p-2 rounded-full shadow-lg border ${book.is_paused ? "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400" : "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-400"
              } transition-transform hover:scale-110 focus:outline-none`}
          >
            {book.is_paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-bold text-xl line-clamp-1" title={book.title}>{book.title}</h4>
            <p className="text-muted-foreground">{book.author}</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            title="Delete Book"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {book.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
            {book.description}
          </p>
        )}

        <div className="mt-auto pt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={book.status}
              onChange={handleStatusChange}
              disabled={isPending}
              className="text-sm bg-muted px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/50 font-medium"
            >
              <option value="want">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="finished">Finished</option>
            </select>

            {book.status === "finished" && (
              <div className="flex gap-1 ml-auto">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={isPending}
                    className="focus:outline-none p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${book.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {book.status === "reading" && book.page_count && (
            <div className="bg-muted/30 border border-border p-4 rounded-xl">
              {/* Progress Bar & Add Pages */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex justify-between text-xs font-medium mb-1.5 px-1">
                    <span>Progress</span>
                    <span>{book.current_page || 0} / {book.page_count} pages ({Math.round(((book.current_page || 0) / book.page_count) * 100)}%)</span>
                  </div>
                  <div className="bg-muted rounded-full h-2.5 overflow-hidden border border-border/50">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, ((book.current_page || 0) / book.page_count) * 100)}%` }}
                    />
                  </div>
                </div>

                <form onSubmit={handleAddPages} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min="1"
                    placeholder="+ Pages"
                    value={pagesToAdd}
                    onChange={(e) => setPagesToAdd(e.target.value)}
                    disabled={isPending}
                    className="w-24 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    type="submit"
                    disabled={!pagesToAdd || isPending}
                    className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Log
                  </button>
                </form>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Duration</p>
                      <p className="text-xs font-medium">{stats.daysSinceStarted} day{stats.daysSinceStarted !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Pace</p>
                      <p className="text-xs font-medium">{stats.pagesPerDay} / day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Est. Finish</p>
                      <p className="text-xs font-medium">{stats.estimatedDaysLeft !== null ? `${stats.estimatedDaysLeft} days` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
              {book.is_paused && (
                <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded w-fit">
                  <AlertCircle className="w-3 h-3" />
                  Time paused
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Book"
        description="Are you sure you want to remove this book from your library? This action cannot be undone."
      />
    </div>
  );
}
