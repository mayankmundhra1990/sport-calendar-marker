import { NextRequest, NextResponse } from "next/server";
import { searchLeagues } from "@/lib/sportsdb";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  const sport = request.nextUrl.searchParams.get("sport") || "Soccer";

  if (!country || country.trim().length < 2) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  }

  const leagues = await searchLeagues(country.trim(), sport);

  return NextResponse.json(leagues, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
