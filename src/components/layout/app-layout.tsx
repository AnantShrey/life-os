"use client";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export function AppLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      {/* pl-16 on mobile to push content right of the fixed sidebar; md:pl-0 since sidebar is in flow */}
      <div className="flex flex-col flex-1 overflow-hidden pl-16 md:pl-0">
        <AppTopbar title={title} />
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto flex-1 min-h-[calc(100vh-64px-48px)]">
            {children}
          </div>
          <footer className="mt-auto h-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center bg-transparent shrink-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Built with ❤️ by <span className="font-medium text-sky-500">Anant Shrey</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
