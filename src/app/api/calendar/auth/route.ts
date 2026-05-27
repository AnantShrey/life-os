import { NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/google-calendar";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const cookieStore = await cookies();

    if (tokens.access_token) {
      cookieStore.set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Get user info to store in DB
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    // Mark as connected in Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && userInfo.data.email) {
      await supabase.from("calendar_connections").upsert({
        user_id: user.id,
        google_account_email: userInfo.data.email,
        is_active: true,
        connected_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    }

    return NextResponse.json({ success: true });
  } catch (e) { const error = e as Error;
    logger.error("Calendar Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
