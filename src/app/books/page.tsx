import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { BookSearch, BookCard } from "./book-components";

export default async function BooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reading = books?.filter(b => b.status === "reading") || [];
  const want = books?.filter(b => b.status === "want") || [];
  const finished = books?.filter(b => b.status === "finished") || [];

  return (
    <AppLayout title="Books Library">
      <div className="max-w-5xl mx-auto">
        <BookSearch />

        <div className="space-y-10">
          {reading.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Currently Reading <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{reading.length}</span>
              </h3>
              <div className="flex flex-col gap-6">
                {reading.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            </section>
          )}

          {want.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Want to Read <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{want.length}</span>
              </h3>
              <div className="flex flex-col gap-6">
                {want.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Finished <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{finished.length}</span>
              </h3>
              <div className="flex flex-col gap-6">
                {finished.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            </section>
          )}

          {!books?.length && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border border-dashed">
              <p>Your library is empty. Search for a book to get started!</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
