import { NextRequest, NextResponse } from "next/server";
import { bulkCreateCalendarEvents, refreshAccessToken } from "@/lib/google-calendar";
import { getAllSeasonEvents } from "@/lib/sportsdb";
import { getTennisFixtures } from "@/lib/allsportsapi";
import { SPORTS, TENNIS_LEAGUE_IDS } from "@/lib/constants";
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

    const { teamId, leagueId, season, matchKeyword } = await request.json();

    if (!teamId || !leagueId || !season) {
      return NextResponse.json({ error: "teamId, leagueId, and season required" }, { status: 400 });
    }

    // Fetch all events — route tennis to AllSportsAPI
    let allEvents;

    if (TENNIS_LEAGUE_IDS.has(leagueId)) {
      allEvents = await getTennisFixtures();
    } else {
      const leagueConfig = SPORTS.flatMap((s) => s.leagues).find((l) => l.id === leagueId);
      const totalRounds = leagueConfig?.totalRounds || 38;
      allEvents = await getAllSeasonEvents(leagueId, season, totalRounds);
    }

    // Filter to only matches involving this team/player
    const teamMatches = matchKeyword
      ? allEvents.filter((match) => {
          const searchText = [match.title, match.homeTeam.name, match.awayTeam.name]
            .join(" ")
            .toLowerCase();
          return searchText.includes(matchKeyword.toLowerCase());
        })
      : allEvents.filter(
          (match) => match.homeTeam.id === teamId || match.awayTeam.id === teamId
        );

    if (teamMatches.length === 0) {
      return NextResponse.json({
        success: true,
        eventIds: {},
        matchesFound: 0,
        matchesSynced: 0,
        errors: [],
      });
    }

    // Bulk create calendar events
    const { eventIds, errors } = await bulkCreateCalendarEvents(accessToken, teamMatches);

    return NextResponse.json({
      success: true,
      eventIds,
      matchesFound: teamMatches.length,
      matchesSynced: Object.keys(eventIds).length,
      errors,
    });
  } catch (err) {
    console.error("Bulk add failed:", err);
    return NextResponse.json({ error: "Failed to sync events" }, { status: 500 });
  }
}
