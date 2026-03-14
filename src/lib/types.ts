export interface LeagueConfig {
  id: string;
  name: string;
  sportId: string;
  season: string;
  country: string;
  totalRounds: number;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  leagues: LeagueConfig[];
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  sport: string;
  leagueId: string;
  leagueName: string;
  stadium: string;
  country: string;
  popularity: number;
  matchKeyword?: string;
}

export interface Match {
  id: string;
  title: string;
  sport: string;
  leagueId: string;
  leagueName: string;
  homeTeam: { id: string; name: string; badge: string };
  awayTeam: { id: string; name: string; badge: string };
  dateTime: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  round: string;
  season: string;
}

export interface UserPreferences {
  selectedSports: string[];
  selectedTeams: Record<string, string[]>;
  teamDetails: Record<string, { name: string; badge: string; leagueId: string; leagueName: string; sport: string; matchKeyword?: string }>;
  calendarEventIds: Record<string, Record<string, string>>; // teamId -> { matchId -> googleEventId }
}

export interface TennisPlayer {
  id: string;
  name: string;
  country: string;
  tour: "atp" | "wta";
  leagueId: string;
  keyword: string;
}

// AllSportsAPI raw types (tennis)
export interface AllSportsAPIFixture {
  event_key: string;
  event_date: string;          // "YYYY-MM-DD"
  event_time: string;          // "HH:MM" or ""
  event_status: string;        // "Scheduled" | "" | "Finished" etc.
  event_first_player: string;  // Player 1 full name
  first_player_key: string;    // Player 1 ID
  event_second_player: string; // Player 2 full name
  second_player_key: string;   // Player 2 ID
  league_name: string;         // Tournament name, e.g., "BNP Paribas Open"
  league_key: string;          // Tournament ID
  league_round: string;        // Round name
  league_season: string;       // e.g., "2026"
  league_surface?: string;     // "clay" | "grass" | "hard"
  event_final_result?: string;
  event_game_result?: string;
}

// TheSportsDB raw API types
export interface SportsDBEvent {
  idEvent: string;
  strEvent: string;
  strSport: string;
  strLeague: string;
  idLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  strDescriptionEN: string | null;
  dateEvent: string;
  strTime: string;
  strTimestamp: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strVenue: string | null;
  strCountry: string | null;
  strStatus: string | null;
  strSeason: string;
  intRound: string | null;
}

export interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string | null;
  strSport: string;
  strLeague: string;
  idLeague: string;
  strStadium: string | null;
  strLocation: string | null;
  strCountry: string | null;
  strBadge: string | null;
  strLogo: string | null;
  intLoved: string | null;
}
