import { NextRequest, NextResponse } from "next/server";
import { getTeamsByLeague } from "@/lib/sportsdb";

export async function GET(request: NextRequest) {
  const league = request.nextUrl.searchParams.get("league");
  if (!league) {
    return NextResponse.json({ error: "league parameter required" }, { status: 400 });
  }

  const teams = await getTeamsByLeague(league);
  return NextResponse.json(teams, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
