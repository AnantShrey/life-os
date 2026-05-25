"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarCheck,
  BookOpen,
  Film,
  Utensils,
  DollarSign,
  Calendar,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  StickyNote,
  Target,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calendar",  href: "/calendar",  icon: Calendar },
  { name: "Tasks",     href: "/tasks",     icon: CheckSquare },
  { name: "Habits",    href: "/habits",    icon: CalendarCheck },
  { name: "Books",     href: "/books",     icon: BookOpen },
  { name: "Watchlist", href: "/watchlist", icon: Film },
  { name: "Nutrition", href: "/nutrition", icon: Utensils },
  { name: "Expenses",  href: "/expenses",  icon: DollarSign },
  { name: "Notes",     href: "/notes",     icon: StickyNote },
  { name: "Goals",     href: "/goals",     icon: Target },
  { name: "Settings",  href: "/settings",  icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read persisted state from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  // Keep sidebar hidden until mounted to avoid SSR/flash mismatch
  if (!mounted) {
    return (
      <aside
        className="w-16 border-r border-border bg-card flex flex-col transition-all duration-300 flex-shrink-0"
        aria-hidden
      />
    );
  }

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={`${sidebarWidth} border-r border-border bg-card flex flex-col flex-shrink-0 overflow-hidden
          transition-[width] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]
          fixed md:relative h-full z-30 md:z-auto`}
        style={{ transitionDuration: "250ms" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center border-b border-border px-4 flex-shrink-0">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-primary flex items-center gap-3 overflow-hidden"
          >
            <div className="w-7 h-7 rounded-[8px] bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
              <img 
                src="/favicon.ico" 
                alt="Life OS" 
                className="w-5 h-5 brightness-0 invert dark:invert-0" 
              />
            </div>
            <span
              className="whitespace-nowrap transition-all duration-200 overflow-hidden"
              style={{
                maxWidth: collapsed ? 0 : 160,
                opacity: collapsed ? 0 : 1,
              }}
            >
              Life OS
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors overflow-hidden ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className="whitespace-nowrap transition-all duration-200"
                  style={{
                    maxWidth: collapsed ? 0 : 200,
                    opacity: collapsed ? 0 : 1,
                    overflow: "hidden",
                  }}
                >
                  {item.name}
                </span>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-foreground text-background rounded-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle button */}
        <div className="border-t border-border p-2">
          <button
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-muted-foreground hover:text-primary hover:bg-muted transition-colors overflow-hidden"
          >
            <CollapseIcon className="w-5 h-5 flex-shrink-0" />
            <span
              className="whitespace-nowrap text-sm font-medium transition-all duration-200"
              style={{
                maxWidth: collapsed ? 0 : 200,
                opacity: collapsed ? 0 : 1,
                overflow: "hidden",
              }}
            >
              {collapsed ? "Expand" : "Collapse"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
