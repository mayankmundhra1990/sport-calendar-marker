import { NextRequest, NextResponse } from "next/server";
import { bulkDeleteCalendarEvents, refreshAccessToken } from "@/lib/google-calendar";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_tokens");

  if (!tokenCookie) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(tokenCookie.value);
    let accessToken = tokens.access_token;

    // Refresh if expired
    if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
      if (!tokens.refresh_token) {
        return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
      }
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      accessToken = newTokens.access_token;
    }

    const { eventIds } = await request.json();

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0, failed: 0 });
    }

    const result = await bulkDeleteCalendarEvents(accessToken, eventIds);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Bulk delete failed:", err);
    return NextResponse.json({ error: "Failed to delete events" }, { status: 500 });
  }
}
