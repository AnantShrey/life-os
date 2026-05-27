"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    logger.error("Global boundary error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 text-center p-6 bg-background text-foreground">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Fatal App Error</h2>
          <p className="text-muted-foreground max-w-md text-lg">
            A critical error occurred that broke the application shell. We apologize for the inconvenience.
          </p>
          
          <button
            onClick={() => reset()}
            className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-[12px] font-medium hover:brightness-110 transition-all shadow-sm"
          >
            <RefreshCw className="w-5 h-5" /> Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
