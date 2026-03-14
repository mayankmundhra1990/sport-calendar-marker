import { NextRequest, NextResponse } from "next/server";
import { getAllSeasonEvents } from "@/lib/sportsdb";
import { getTennisFixtures } from "@/lib/allsportsapi";
import { TENNIS_LEAGUE_IDS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const leagueId = request.nextUrl.searchParams.get("leagueId");
  const season = request.nextUrl.searchParams.get("season");
  const totalRounds = parseInt(request.nextUrl.searchParams.get("totalRounds") || "38", 10);

  if (!leagueId || !season) {
    return NextResponse.json({ error: "leagueId and season parameters required" }, { status: 400 });
  }

  let events;

  if (TENNIS_LEAGUE_IDS.has(leagueId)) {
    // Tennis: use AllSportsAPI with date-range fetching
    events = await getTennisFixtures();
  } else {
    // All other sports: use TheSportsDB with round-based fetching
    events = await getAllSeasonEvents(leagueId, season, totalRounds);
  }

  return NextResponse.json(events, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}
