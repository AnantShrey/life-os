export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  icon: string | null;
  color: string;
  frequency: string;
  time_of_day: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  completed_at: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  timeframe: string;
  type: string;
  category: string | null;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  completed: boolean;
  linked_module: string | null;
  color: string;
  icon: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  google_books_id: string | null;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: 'want' | 'reading' | 'finished';
  rating: number | null;
  pages_read: number;
  total_pages: number | null;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  tmdb_id: number | null;
  title: string;
  type: 'movie' | 'tv';
  status: 'want' | 'watching' | 'watched';
  poster_path: string | null;
  release_year: number | null;
  tmdb_rating: number | null;
  user_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_watchlist_id: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  all_day: boolean;
  color: string;
  location: string | null;
  source: 'local' | 'google';
  google_event_id: string | null;
}
