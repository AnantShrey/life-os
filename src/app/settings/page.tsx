import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { CurrencySelector } from "@/components/settings/CurrencySelector";
import { DataExportButton } from "@/components/settings/DataExportButton";
import { getPreferences, updateDisplayName } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const prefs = await getPreferences();
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error as string;
  const success = resolvedSearchParams.success as string;

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Preferences card */}
        <div
          className="bg-card rounded-[20px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-5">
            Preferences
          </p>

          <div className="flex flex-col gap-6">
            <form action={updateDisplayName} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Display Name</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  How we greet you on the dashboard
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="name"
                  defaultValue={prefs?.display_name || ""}
                  placeholder="Your Name"
                  className="px-3 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-40"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Save
                </button>
              </div>
            </form>

            <div className="h-px bg-border w-full" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Currency</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Used for all money amounts in the app
                </p>
              </div>
              <CurrencySelector current={prefs.currency ?? "INR"} />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-[12px] px-4 py-3 mt-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-[12px] px-4 py-3 mt-6">
            {success}
          </div>
        )}

        <div
          className="bg-card rounded-[20px] p-6 mt-6"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-5">
            Data Management
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Export Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download a JSON file of all your data (habits, tasks, expenses, goals, watchlist, and notes)
              </p>
            </div>
            <DataExportButton />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
