import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
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
    const userRef = db.collection("users").doc(googleId);
    await userRef.set(
      {
        email,
        access_token: accessToken,
        refresh_token: tokens.refresh_token ?? null,
        token_expiry: tokens.expiry_date ?? null,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    // Check if created_at exists, set it if not
    const userSnap = await userRef.get();
    if (!userSnap.data()?.created_at) {
      await userRef.update({ created_at: new Date().toISOString() });
    }

    const { teams }: { teams: TeamPayload[] } = await request.json();

    // Delete all existing teams for this user
    const teamsCollection = userRef.collection("teams");
    const existingTeams = await teamsCollection.get();
    const batch = db.batch();
    existingTeams.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    // Insert new teams
    if (teams.length > 0) {
      const insertBatch = db.batch();
      for (const t of teams) {
        const teamRef = teamsCollection.doc(t.teamId);
        insertBatch.set(teamRef, {
          team_name: t.teamName,
          sport: t.sport,
          league_id: t.leagueId,
          league_name: t.leagueName,
          badge: t.badge ?? "",
          match_keyword: t.matchKeyword ?? null,
          created_at: new Date().toISOString(),
        });
      }
      await insertBatch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("User sync failed:", err);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
