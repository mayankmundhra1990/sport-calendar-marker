import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getAllSeasonEvents } from "@/lib/sportsdb";
import { getTennisFixtures } from "@/lib/allsportsapi";
import { TENNIS_LEAGUE_IDS } from "@/lib/constants";

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours — fallback if cache is older

export async function GET(request: NextRequest) {
  const leagueId = request.nextUrl.searchParams.get("leagueId");
  const season = request.nextUrl.searchParams.get("season");
  const totalRounds = parseInt(request.nextUrl.searchParams.get("totalRounds") || "38", 10);

  if (!leagueId || !season) {
    return NextResponse.json({ error: "leagueId and season parameters required" }, { status: 400 });
  }

  // Try reading from Firestore cache first
  try {
    const cacheDoc = await db.doc(`cached_matches/${leagueId}`).get();

    if (cacheDoc.exists) {
      const data = cacheDoc.data();
      const lastRefreshed = data?.lastRefreshed ? new Date(data.lastRefreshed).getTime() : 0;
      const isFresh = Date.now() - lastRefreshed < CACHE_MAX_AGE_MS;

      if (isFresh && data && data.matches?.length > 0) {
        return NextResponse.json(data.matches, {
          headers: { "Cache-Control": "public, s-maxage=1800" },
        });
      }
    }
  } catch (err) {
    console.error(`Cache read failed for league ${leagueId}:`, err);
  }

  // Fallback: fetch live from external APIs
  let events;

  if (TENNIS_LEAGUE_IDS.has(leagueId)) {
    events = await getTennisFixtures();
  } else {
    events = await getAllSeasonEvents(leagueId, season, totalRounds);
  }

  return NextResponse.json(events, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}
