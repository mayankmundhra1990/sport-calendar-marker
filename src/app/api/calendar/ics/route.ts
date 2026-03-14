import { NextRequest } from "next/server";
import { generateSingleIcs } from "@/lib/ics-generator";
import type { Match } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const match: Match = {
    id: sp.get("matchId") || "",
    title: sp.get("title") || "Match",
    sport: sp.get("sport") || "football",
    leagueId: "",
    leagueName: sp.get("league") || "",
    homeTeam: { id: "", name: sp.get("homeTeam") || "", badge: "" },
    awayTeam: { id: "", name: sp.get("awayTeam") || "", badge: "" },
    dateTime: sp.get("dateTime") || "",
    date: sp.get("date") || "",
    time: sp.get("time") || "00:00:00",
    venue: sp.get("venue") || "TBD",
    status: "Scheduled",
    round: sp.get("round") || "",
    season: "",
  };

  try {
    const icsContent = generateSingleIcs(match);
    const filename = match.title.replace(/[^a-zA-Z0-9]/g, "_") + ".ics";

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response("Failed to generate calendar file", { status: 500 });
  }
}
