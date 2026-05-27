import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { CurrencySelector } from "@/components/settings/CurrencySelector";
import { DataExportButton } from "@/components/settings/DataExportButton";
import { getPreferences } from "./actions";

export default async function SettingsPage() {
  const prefs = await getPreferences();

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
