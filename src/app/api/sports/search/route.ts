import { NextRequest, NextResponse } from "next/server";
import { searchTeams } from "@/lib/sportsdb";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const sport = request.nextUrl.searchParams.get("sport"); // optional sport filter

  if (!q || q.trim().length < 2) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  }

  let teams = await searchTeams(q.trim());

  // Optionally filter by sport
  if (sport) {
    teams = teams.filter((t) => t.sport === sport);
  }

  return NextResponse.json(teams, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
