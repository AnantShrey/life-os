"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function searchGoogleBooks(query: string) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    logger.error("Missing Google Books API Key");
    return [];
  }

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=5`);
  if (!res.ok) return [];
  const data = await res.json();
  
  return (data.items || []).map((item: any) => ({
    google_books_id: item.id,
    title: item.volumeInfo.title || "Unknown Title",
    author: item.volumeInfo.authors?.join(", ") || "Unknown Author",
    cover_url: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || null,
    page_count: item.volumeInfo.pageCount || null,
    description: item.volumeInfo.description || null,
  }));
}

export async function addBook(bookData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("books").insert({
      user_id: user.id,
      title: bookData.title,
      author: bookData.author,
      cover_url: bookData.cover_url,
      page_count: bookData.page_count,
      google_books_id: bookData.google_books_id,
      description: bookData.description,
      status: "want",
    });
    revalidatePath("/books");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Add book error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBookStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updates: Record<string, any> = { status };
  
  if (status === "reading") {
    const { data: book } = await supabase.from("books").select("started_reading_at").eq("id", id).single();
    if (!book?.started_reading_at) {
      updates.started_reading_at = new Date().toISOString();
      updates.last_resumed_at = new Date().toISOString();
      updates.is_paused = false;
    }
  } else if (status === "finished") {
    const { data: book } = await supabase.from("books").select("*").eq("id", id).single();
    if (book && !book.is_paused && book.last_resumed_at) {
      const msSinceResume = new Date().getTime() - new Date(book.last_resumed_at).getTime();
      updates.total_reading_time_ms = Number(book.total_reading_time_ms || 0) + msSinceResume;
      updates.is_paused = true;
    }
  }

  try {
    await supabase.from("books").update(updates).eq("id", id).eq("user_id", user.id);
    revalidatePath("/books");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Update book status error:", error);
    return { success: false, error: error.message };
  }
}

export async function addBookPages(id: string, pagesToAdd: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: book } = await supabase.from("books").select("current_page, page_count").eq("id", id).single();
  if (!book) return;

  const newPage = Math.min((book.current_page || 0) + pagesToAdd, book.page_count || 99999);
  const updates: Record<string, any> = { current_page: newPage };
  
  if (book.page_count && newPage >= book.page_count) {
    updates.status = "finished";
    const { data: fullBook } = await supabase.from("books").select("*").eq("id", id).single();
    if (fullBook && !fullBook.is_paused && fullBook.last_resumed_at) {
      const msSinceResume = new Date().getTime() - new Date(fullBook.last_resumed_at).getTime();
      updates.total_reading_time_ms = Number(fullBook.total_reading_time_ms || 0) + msSinceResume;
      updates.is_paused = true;
    }
  }

  try {
    await supabase.from("books").update(updates).eq("id", id).eq("user_id", user.id);
    revalidatePath("/books");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Add book pages error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleBookPause(id: string, isPaused: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: book } = await supabase.from("books").select("*").eq("id", id).single();
  if (!book) return;

  const updates: Record<string, any> = { is_paused: isPaused };

  if (isPaused) {
    if (book.last_resumed_at) {
      const msSinceResume = new Date().getTime() - new Date(book.last_resumed_at).getTime();
      updates.total_reading_time_ms = Number(book.total_reading_time_ms || 0) + msSinceResume;
    }
  } else {
    updates.last_resumed_at = new Date().toISOString();
  }

  try {
    await supabase.from("books").update(updates).eq("id", id).eq("user_id", user.id);
    revalidatePath("/books");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Toggle book pause error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBookRating(id: string, rating: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("books").update({ rating }).eq("id", id).eq("user_id", user.id);
    revalidatePath("/books");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Update book rating error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBook(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("books").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/books");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Delete book error:", error);
    return { success: false, error: error.message };
  }
}
