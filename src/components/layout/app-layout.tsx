"use client";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { CommandPalette } from "./CommandPalette";

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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
