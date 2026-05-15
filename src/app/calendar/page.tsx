import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { ConnectCalendarPrompt } from "@/components/calendar/ConnectCalendarPrompt";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { cookies } from "next/headers";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: connection } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const cookieStore = await cookies();
  const hasRefreshToken = !!cookieStore.get("google_refresh_token")?.value;

  const isConnected = connection?.is_active && hasRefreshToken;

  return (
    <AppLayout title="Google Calendar">
      <div className="max-w-6xl mx-auto">
        {!isConnected ? (
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <ConnectCalendarPrompt />
          </GoogleOAuthProvider>
        ) : (
          <>
            <CalendarHeader />
            <CalendarView />
          </>
        )}
      </div>
    </AppLayout>
  );
}
