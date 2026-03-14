import { NextRequest } from "next/server";
import { generateMultipleIcs } from "@/lib/ics-generator";
import { getSeasonEvents } from "@/lib/sportsdb";
import { SPORTS } from "@/lib/constants";
import type { Match } from "@/lib/types";

export async function GET(request: NextRequest) {
  const teamsParam = request.nextUrl.searchParams.get("teams");
  if (!teamsParam) {
    return new Response("teams parameter required", { status: 400 });
  }

  const teamIds = new Set(teamsParam.split(","));

  // Find which leagues we need to fetch by checking all configured leagues
  const leaguesToFetch: { id: string; season: string; totalRounds: number }[] = [];
  for (const sport of SPORTS) {
    for (const league of sport.leagues) {
      leaguesToFetch.push({ id: league.id, season: league.season, totalRounds: league.totalRounds });
    }
  }

  try {
    // Fetch events from all leagues
    const results = await Promise.all(
      leaguesToFetch.map((l) => getSeasonEvents(l.id, l.season, l.totalRounds).catch(() => []))
    );

    // Filter to only matches involving requested teams
    const allMatches: Match[] = results
      .flat()
      .filter((match) => teamIds.has(match.homeTeam.id) || teamIds.has(match.awayTeam.id));

    const icsContent = generateMultipleIcs(allMatches);

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch {
    return new Response("Failed to generate calendar feed", { status: 500 });
  }
}
