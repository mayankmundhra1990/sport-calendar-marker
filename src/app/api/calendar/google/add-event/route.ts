import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent, refreshAccessToken } from "@/lib/google-calendar";
import { cookies } from "next/headers";
import type { Match } from "@/lib/types";

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

      // Update cookie with new tokens
      const response = NextResponse.json({ success: true });
      response.cookies.set("google_tokens", JSON.stringify({
        access_token: newTokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: newTokens.expiry_date,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    const match: Match = await request.json();
    await createCalendarEvent(accessToken, match);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to create calendar event:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
