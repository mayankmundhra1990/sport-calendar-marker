import type { Match, Team, SportsDBEvent, SportsDBTeam } from "./types";
import { SPORTSDB_BASE_URL } from "./constants";
import { normalizeEvent, normalizeTeam } from "./normalize";

/** Safely parse JSON from a fetch response; returns null if the response isn't valid JSON */
async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && !contentType.includes("text/json")) {
    // Likely an HTML error/rate-limit page
    return null;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getTeamsByLeague(leagueName: string): Promise<Team[]> {
  const res = await fetch(
    `${SPORTSDB_BASE_URL}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`,
    { next: { revalidate: 86400 } }
  );
  const data = await safeJson(res);
  if (!data?.teams) return [];
  return (data.teams as SportsDBTeam[])
    .map(normalizeTeam)
    .sort((a, b) => b.popularity - a.popularity);
}

export async function searchTeams(query: string): Promise<Team[]> {
  const res = await fetch(
    `${SPORTSDB_BASE_URL}/searchteams.php?t=${encodeURIComponent(query)}`,
    { next: { revalidate: 86400 } }
  );
  const data = await safeJson(res);
  if (!data?.teams) return [];
  return (data.teams as SportsDBTeam[])
    .map(normalizeTeam)
    .sort((a, b) => b.popularity - a.popularity);
}

async function getEventsForRound(leagueId: string, round: number, season: string): Promise<Match[]> {
  try {
    const res = await fetch(
      `${SPORTSDB_BASE_URL}/eventsround.php?id=${leagueId}&r=${round}&s=${encodeURIComponent(season)}`,
      { next: { revalidate: 3600 } }
    );
    const data = await safeJson(res);
    if (!data?.events) return [];
    return (data.events as SportsDBEvent[]).map(normalizeEvent);
  } catch {
    return [];
  }
}

/** Small delay helper to avoid rate-limiting on TheSportsDB free tier */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAllSeasonEvents(leagueId: string, season: string, totalRounds: number): Promise<Match[]> {
  const allEvents: Match[] = [];
  const BATCH_SIZE = 3; // Reduced from 5 to be gentler on free-tier rate limits

  for (let i = 1; i <= totalRounds; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, totalRounds - i + 1) },
      (_, idx) => i + idx
    );
    const results = await Promise.all(
      batch.map((round) => getEventsForRound(leagueId, round, season))
    );
    allEvents.push(...results.flat());

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE <= totalRounds) {
      await delay(200);
    }
  }

  // Deduplicate by event ID and sort by date
  const seen = new Set<string>();
  return allEvents
    .filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

// Keep backward-compatible alias for any code still referencing getSeasonEvents
export const getSeasonEvents = getAllSeasonEvents;

/**
 * Search leagues by country and sport name.
 * Sport names use TheSportsDB conventions: "Soccer", "Basketball", "Cricket", etc.
 */
export async function searchLeagues(
  country: string,
  sportName: string = "Soccer"
): Promise<{ idLeague: string; strLeague: string; strSport: string; strCountry: string }[]> {
  const res = await fetch(
    `${SPORTSDB_BASE_URL}/search_all_leagues.php?c=${encodeURIComponent(country)}&s=${encodeURIComponent(sportName)}`,
    { next: { revalidate: 86400 } }
  );
  const data = await safeJson(res);
  if (!data?.countries) return []; // TheSportsDB uses "countries" key for this endpoint
  return data.countries as { idLeague: string; strLeague: string; strSport: string; strCountry: string }[];
}
