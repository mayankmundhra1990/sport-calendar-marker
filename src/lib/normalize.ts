import type { Match, Team, SportsDBEvent, SportsDBTeam, AllSportsAPIFixture } from "./types";
import { SPORT_NAME_MAP } from "./constants";

function parseTennisPlayers(raw: SportsDBEvent): { player1: string; player2: string; tournament: string } {
  // Try description first: "Tournament - City - Round\nPlayer1 (rank) vs Player2 (rank)"
  if (raw.strDescriptionEN) {
    const lines = raw.strDescriptionEN.split("\n");
    const matchLine = lines[lines.length - 1]?.trim();
    if (matchLine && matchLine.includes(" vs ")) {
      const cleaned = matchLine.replace(/\s*\(\d+\)/g, "");
      const [p1, p2] = cleaned.split(" vs ").map((s) => s.trim());
      const tournament = lines[0]?.split(" - ")[0]?.trim() || "";
      if (p1 && p2) return { player1: p1, player2: p2, tournament };
    }
  }
  // Fallback: parse from event title "Tournament Player1 vs Player2"
  const vsIdx = raw.strEvent?.indexOf(" vs ") ?? -1;
  if (vsIdx !== -1) {
    const player2 = raw.strEvent.slice(vsIdx + 4).trim();
    const leftPart = raw.strEvent.slice(0, vsIdx).trim();
    // Last word(s) after tournament name — use simple heuristic
    const player1 = leftPart.split(" ").pop() || leftPart;
    return { player1, player2, tournament: "" };
  }
  return { player1: "", player2: "", tournament: "" };
}

export function normalizeEvent(raw: SportsDBEvent): Match {
  const sport = SPORT_NAME_MAP[raw.strSport] || raw.strSport.toLowerCase();
  const isTennis = !raw.strHomeTeam && !raw.strAwayTeam;

  let homeTeam = { id: raw.idHomeTeam || "", name: raw.strHomeTeam || "", badge: raw.strHomeTeamBadge || "" };
  let awayTeam = { id: raw.idAwayTeam || "", name: raw.strAwayTeam || "", badge: raw.strAwayTeamBadge || "" };
  let venue = raw.strVenue || "TBD";

  if (isTennis) {
    const { player1, player2, tournament } = parseTennisPlayers(raw);
    homeTeam = { id: "", name: player1, badge: "" };
    awayTeam = { id: "", name: player2, badge: "" };
    if (tournament && venue === "TBD") venue = tournament;
  }

  return {
    id: raw.idEvent,
    title: raw.strEvent,
    sport,
    leagueId: raw.idLeague,
    leagueName: raw.strLeague,
    homeTeam,
    awayTeam,
    dateTime: raw.strTimestamp,
    date: raw.dateEvent,
    time: raw.strTime || "00:00:00",
    venue,
    status: raw.strStatus || "Not Started",
    round: raw.intRound || "",
    season: raw.strSeason,
  };
}

export function normalizeAllSportsFixture(raw: AllSportsAPIFixture): Match {
  const time = raw.event_time || "00:00";
  // Ensure time has seconds
  const fullTime = time.includes(":") && time.split(":").length === 2 ? `${time}:00` : time;

  return {
    id: `allsports_${raw.event_key}`,
    title: `${raw.event_first_player} vs ${raw.event_second_player}`,
    sport: "tennis",
    leagueId: raw.league_key,
    leagueName: raw.league_name,
    homeTeam: {
      id: raw.first_player_key,
      name: raw.event_first_player,
      badge: "",
    },
    awayTeam: {
      id: raw.second_player_key,
      name: raw.event_second_player,
      badge: "",
    },
    dateTime: `${raw.event_date}T${fullTime}Z`,
    date: raw.event_date,
    time: fullTime,
    venue: raw.league_name,
    status: raw.event_status || "Scheduled",
    round: raw.league_round || "",
    season: raw.league_season || "",
  };
}

export function normalizeTeam(raw: SportsDBTeam): Team {
  const sport = SPORT_NAME_MAP[raw.strSport] || raw.strSport.toLowerCase();
  return {
    id: raw.idTeam,
    name: raw.strTeam,
    shortName: raw.strTeamShort || raw.strTeam,
    badge: raw.strBadge || "",
    sport,
    leagueId: raw.idLeague,
    leagueName: raw.strLeague,
    stadium: raw.strStadium || "",
    country: raw.strCountry || "",
    popularity: parseInt(raw.intLoved || "0", 10) || 0,
  };
}
