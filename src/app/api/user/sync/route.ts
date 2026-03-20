import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getGoogleUserInfo, refreshAccessToken } from "@/lib/google-calendar";

interface TeamPayload {
  teamId: string;
  teamName: string;
  sport: string;
  leagueId: string;
  leagueName: string;
  badge?: string;
  matchKeyword?: string;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_tokens");

  if (!tokenCookie) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    let tokens = JSON.parse(tokenCookie.value);
    let accessToken = tokens.access_token;

    // Refresh token if expired
    if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
      if (!tokens.refresh_token) {
        return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
      }
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      accessToken = newTokens.access_token;
      tokens = { ...tokens, access_token: newTokens.access_token, expiry_date: newTokens.expiry_date };
    }

    const { id: googleId, email } = await getGoogleUserInfo(accessToken);

    // Upsert user with latest tokens
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          google_id: googleId,
          email,
          access_token: accessToken,
          refresh_token: tokens.refresh_token ?? null,
          token_expiry: tokens.expiry_date ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "google_id" }
      )
      .select("id")
      .single();

    if (userError || !user) {
      console.error("Failed to upsert user:", userError);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    const { teams }: { teams: TeamPayload[] } = await request.json();

    // Replace all teams for this user
    await supabase.from("user_teams").delete().eq("user_id", user.id);

    if (teams.length > 0) {
      const { error: insertError } = await supabase.from("user_teams").insert(
        teams.map((t) => ({
          user_id: user.id,
          team_id: t.teamId,
          team_name: t.teamName,
          sport: t.sport,
          league_id: t.leagueId,
          league_name: t.leagueName,
          badge: t.badge ?? "",
          match_keyword: t.matchKeyword ?? null,
        }))
      );
      if (insertError) {
        console.error("Failed to insert user teams:", insertError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("User sync failed:", err);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
