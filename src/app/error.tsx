"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    logger.error("App boundary error:", error);
  }, [error]);

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred in this section of the app. We've logged the issue.
      </p>
      
      <button
        onClick={() => reset()}
        className="mt-4 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-[12px] font-medium hover:brightness-110 transition-all shadow-sm"
      >
        <RefreshCw className="w-4 h-4" /> Try again
      </button>
    </div>
  );
}
