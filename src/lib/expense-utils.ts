import {
  Utensils, Car, ShoppingBag, Tv, Heart, Home,
  GraduationCap, Plane, Sparkles, RefreshCw, TrendingUp, MoreHorizontal,
} from "lucide-react";

export type CategoryConfig = {
  name: string;
  icon: React.ElementType;
  color: string;       // tailwind text color
  bg: string;          // tailwind bg color (light)
  hex: string;         // hex for recharts
};

export const CATEGORIES: CategoryConfig[] = [
  { name: "Food & Dining",        icon: Utensils,        color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-950/40", hex: "#f97316" },
  { name: "Transport",            icon: Car,             color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-950/40",   hex: "#3b82f6" },
  { name: "Shopping",             icon: ShoppingBag,     color: "text-pink-500",   bg: "bg-pink-100 dark:bg-pink-950/40",   hex: "#ec4899" },
  { name: "Entertainment",        icon: Tv,              color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-950/40",hex: "#a855f7" },
  { name: "Health & Fitness",     icon: Heart,           color: "text-red-500",    bg: "bg-red-100 dark:bg-red-950/40",     hex: "#ef4444" },
  { name: "Housing & Utilities",  icon: Home,            color: "text-amber-500",  bg: "bg-amber-100 dark:bg-amber-950/40", hex: "#f59e0b" },
  { name: "Education",            icon: GraduationCap,   color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-950/40",hex: "#6366f1" },
  { name: "Travel",               icon: Plane,           color: "text-sky-500",    bg: "bg-sky-100 dark:bg-sky-950/40",     hex: "#0ea5e9" },
  { name: "Personal Care",        icon: Sparkles,        color: "text-rose-500",   bg: "bg-rose-100 dark:bg-rose-950/40",   hex: "#f43f5e" },
  { name: "Subscriptions",        icon: RefreshCw,       color: "text-teal-500",   bg: "bg-teal-100 dark:bg-teal-950/40",   hex: "#14b8a6" },
  { name: "Investments & Savings",icon: TrendingUp,      color: "text-green-500",  bg: "bg-green-100 dark:bg-green-950/40", hex: "#22c55e" },
  { name: "Other",                icon: MoreHorizontal,  color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800",    hex: "#64748b" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.name, c]));

export function getCategoryConfig(name: string): CategoryConfig {
  return CATEGORY_MAP[name] ?? CATEGORIES[CATEGORIES.length - 1];
}

export const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "INR — ₹ Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD — $ US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR — € Euro" },
  { code: "GBP", symbol: "£", label: "GBP — £ British Pound" },
  { code: "JPY", symbol: "¥", label: "JPY — ¥ Japanese Yen" },
  { code: "AED", symbol: "د.إ", label: "AED — د.إ UAE Dirham" },
];

export function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
