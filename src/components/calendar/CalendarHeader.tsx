"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlink, X } from "lucide-react";
import { logger } from "@/lib/logger";

export function CalendarHeader() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/calendar/disconnect", { method: "POST" });
      // Refresh the page — it will now show the connect prompt
      router.refresh();
    } catch (e) {
      logger.error(e);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Toolbar row */}
      <div className="flex items-center justify-end mb-4 gap-3">
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Unlink className="w-4 h-4" />
          Disconnect Calendar
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            className="bg-card w-full max-w-[420px] rounded-[20px] p-8 flex flex-col gap-5"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
            }}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">Disconnect Google Calendar?</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              This will remove your calendar connection. Your existing events will not be deleted
              from Google Calendar.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 border border-border rounded-[12px] text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-[12px] text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
