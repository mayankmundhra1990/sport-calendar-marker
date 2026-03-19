import type { Sport, TennisPlayer } from "./types";

export const SPORTSDB_BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

export const SPORT_NAME_MAP: Record<string, string> = {
  Soccer: "football",
  Basketball: "basketball",
  Cricket: "cricket",
  Tennis: "tennis",
};

export const DURATION_MINUTES: Record<string, number> = {
  football: 120,
  basketball: 150,
  cricket: 240,
  tennis: 180,
};

export const SPORTS: Sport[] = [
  {
    id: "football",
    name: "Football",
    icon: "⚽",
    leagues: [
      // Top 5 European Leagues
      { id: "4328", name: "English Premier League", sportId: "football", season: "2025-2026", country: "England", totalRounds: 38 },
      { id: "4335", name: "Spanish La Liga", sportId: "football", season: "2025-2026", country: "Spain", totalRounds: 38 },
      { id: "4331", name: "German Bundesliga", sportId: "football", season: "2025-2026", country: "Germany", totalRounds: 34 },
      { id: "4332", name: "Italian Serie A", sportId: "football", season: "2025-2026", country: "Italy", totalRounds: 38 },
      { id: "4334", name: "French Ligue 1", sportId: "football", season: "2025-2026", country: "France", totalRounds: 34 },
      // Other European Leagues
      { id: "4337", name: "Dutch Eredivisie", sportId: "football", season: "2025-2026", country: "Netherlands", totalRounds: 34 },
      { id: "4344", name: "Portuguese Primeira Liga", sportId: "football", season: "2025-2026", country: "Portugal", totalRounds: 34 },
      { id: "4330", name: "Scottish Premiership", sportId: "football", season: "2025-2026", country: "Scotland", totalRounds: 38 },
      { id: "4339", name: "Turkish Super Lig", sportId: "football", season: "2025-2026", country: "Turkey", totalRounds: 34 },
      { id: "4355", name: "Belgian Pro League", sportId: "football", season: "2025-2026", country: "Belgium", totalRounds: 30 },
      // European Competitions
      { id: "4480", name: "UEFA Champions League", sportId: "football", season: "2025-2026", country: "Europe", totalRounds: 17 },
      { id: "4481", name: "UEFA Europa League", sportId: "football", season: "2025-2026", country: "Europe", totalRounds: 15 },
      // Americas
      { id: "4346", name: "American Major League Soccer", sportId: "football", season: "2026", country: "USA", totalRounds: 34 },
      { id: "4351", name: "Brazilian Serie A", sportId: "football", season: "2026", country: "Brazil", totalRounds: 38 },
      { id: "4406", name: "Argentine Primera Division", sportId: "football", season: "2026", country: "Argentina", totalRounds: 28 },
      { id: "4350", name: "Mexican Primera League", sportId: "football", season: "2026", country: "Mexico", totalRounds: 17 },
      // Middle East
      { id: "4396", name: "Saudi Pro League", sportId: "football", season: "2025-2026", country: "Saudi Arabia", totalRounds: 30 },
    ],
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    leagues: [
      { id: "4387", name: "NBA", sportId: "basketball", season: "2025-2026", country: "USA", totalRounds: 26 },
    ],
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    leagues: [
      { id: "4460", name: "Indian Premier League", sportId: "cricket", season: "2026", country: "India", totalRounds: 20 },
    ],
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "🎾",
    leagues: [
      { id: "4464", name: "ATP World Tour", sportId: "tennis", season: "2026", country: "International", totalRounds: 15 },
      { id: "4517", name: "WTA Tour", sportId: "tennis", season: "2026", country: "International", totalRounds: 15 },
    ],
  },
];

export const TENNIS_PLAYERS: TennisPlayer[] = [
  // ATP Top 10 (March 2026)
  { id: "player_alcaraz", name: "Carlos Alcaraz", country: "Spain", tour: "atp", leagueId: "4464", keyword: "Alcaraz" },
  { id: "player_sinner", name: "Jannik Sinner", country: "Italy", tour: "atp", leagueId: "4464", keyword: "Sinner" },
  { id: "player_djokovic", name: "Novak Djokovic", country: "Serbia", tour: "atp", leagueId: "4464", keyword: "Djokovic" },
  { id: "player_zverev", name: "Alexander Zverev", country: "Germany", tour: "atp", leagueId: "4464", keyword: "Zverev" },
  { id: "player_musetti", name: "Lorenzo Musetti", country: "Italy", tour: "atp", leagueId: "4464", keyword: "Musetti" },
  { id: "player_deminaur", name: "Alex De Minaur", country: "Australia", tour: "atp", leagueId: "4464", keyword: "De Minaur" },
  { id: "player_fritz", name: "Taylor Fritz", country: "USA", tour: "atp", leagueId: "4464", keyword: "Fritz" },
  { id: "player_shelton", name: "Ben Shelton", country: "USA", tour: "atp", leagueId: "4464", keyword: "Shelton" },
  { id: "player_faa", name: "Felix Auger-Aliassime", country: "Canada", tour: "atp", leagueId: "4464", keyword: "Aliassime" },
  { id: "player_bublik", name: "Alexander Bublik", country: "Kazakhstan", tour: "atp", leagueId: "4464", keyword: "Bublik" },
  // ATP Grand Slam winners outside top 10
  { id: "player_medvedev", name: "Daniil Medvedev", country: "Russia", tour: "atp", leagueId: "4464", keyword: "Medvedev" },
  { id: "player_wawrinka", name: "Stan Wawrinka", country: "Switzerland", tour: "atp", leagueId: "4464", keyword: "Wawrinka" },
  { id: "player_cilic", name: "Marin Cilic", country: "Croatia", tour: "atp", leagueId: "4464", keyword: "Cilic" },

  // WTA Top 10 (March 2026)
  { id: "player_sabalenka", name: "Aryna Sabalenka", country: "Belarus", tour: "wta", leagueId: "4517", keyword: "Sabalenka" },
  { id: "player_swiatek", name: "Iga Swiatek", country: "Poland", tour: "wta", leagueId: "4517", keyword: "Swiatek" },
  { id: "player_rybakina", name: "Elena Rybakina", country: "Kazakhstan", tour: "wta", leagueId: "4517", keyword: "Rybakina" },
  { id: "player_gauff", name: "Coco Gauff", country: "USA", tour: "wta", leagueId: "4517", keyword: "Gauff" },
  { id: "player_pegula", name: "Jessica Pegula", country: "USA", tour: "wta", leagueId: "4517", keyword: "Pegula" },
  { id: "player_anisimova", name: "Amanda Anisimova", country: "USA", tour: "wta", leagueId: "4517", keyword: "Anisimova" },
  { id: "player_paolini", name: "Jasmine Paolini", country: "Italy", tour: "wta", leagueId: "4517", keyword: "Paolini" },
  { id: "player_andreeva", name: "Mirra Andreeva", country: "Russia", tour: "wta", leagueId: "4517", keyword: "Andreeva" },
  { id: "player_svitolina", name: "Elina Svitolina", country: "Ukraine", tour: "wta", leagueId: "4517", keyword: "Svitolina" },
  { id: "player_mboko", name: "Victoria Mboko", country: "Canada", tour: "wta", leagueId: "4517", keyword: "Mboko" },
  // WTA Grand Slam winners outside top 10
  { id: "player_keys", name: "Madison Keys", country: "USA", tour: "wta", leagueId: "4517", keyword: "Madison Keys" },
  { id: "player_osaka", name: "Naomi Osaka", country: "Japan", tour: "wta", leagueId: "4517", keyword: "Osaka" },
  { id: "player_raducanu", name: "Emma Raducanu", country: "United Kingdom", tour: "wta", leagueId: "4517", keyword: "Raducanu" },
  { id: "player_andreescu", name: "Bianca Andreescu", country: "Canada", tour: "wta", leagueId: "4517", keyword: "Andreescu" },
  { id: "player_vondrousova", name: "Marketa Vondrousova", country: "Czech Republic", tour: "wta", leagueId: "4517", keyword: "Vondrousova" },
  { id: "player_kenin", name: "Sofia Kenin", country: "USA", tour: "wta", leagueId: "4517", keyword: "Kenin" },
  { id: "player_ostapenko", name: "Jelena Ostapenko", country: "Latvia", tour: "wta", leagueId: "4517", keyword: "Ostapenko" },
  { id: "player_krejcikova", name: "Barbora Krejcikova", country: "Czech Republic", tour: "wta", leagueId: "4517", keyword: "Krejcikova" },
  { id: "player_azarenka", name: "Victoria Azarenka", country: "Belarus", tour: "wta", leagueId: "4517", keyword: "Azarenka" },
];

// Tennis league IDs (TheSportsDB) — used to route tennis requests to AllSportsAPI
export const TENNIS_LEAGUE_IDS = new Set(["4464", "4517"]);

// Flat lookup for league config — used by useEvents to resolve season/totalRounds for any league
// Includes all SPORTS leagues + extras for dynamic search results
export const LEAGUE_CONFIG_MAP: Record<string, { season: string; totalRounds: number }> = Object.fromEntries(
  SPORTS.flatMap((sport) =>
    sport.leagues.map((l) => [l.id, { season: l.season, totalRounds: l.totalRounds }])
  )
);

export const SPORT_COLORS: Record<string, { accent: string; lightHex: string; light: string; text: string; border: string }> = {
  football:   { accent: "#16a34a", lightHex: "#f0fdf4", light: "bg-green-50",  text: "text-green-700",  border: "border-green-600" },
  basketball: { accent: "#ea580c", lightHex: "#fff7ed", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-600" },
  cricket:    { accent: "#0d9488", lightHex: "#f0fdfa", light: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-600" },
  tennis:     { accent: "#65a30d", lightHex: "#f7fee7", light: "bg-lime-50",   text: "text-lime-700",   border: "border-lime-600" },
};

export const FOOTBALL_REGIONS: Record<string, string> = {
  "4328": "Europe", "4335": "Europe", "4331": "Europe", "4332": "Europe", "4334": "Europe",
  "4337": "Europe", "4344": "Europe", "4330": "Europe", "4339": "Europe", "4355": "Europe",
  "4480": "European Competitions", "4481": "European Competitions",
  "4346": "Americas", "4351": "Americas", "4406": "Americas", "4350": "Americas",
  "4396": "Middle East",
};

export const DEFAULT_PREFERENCES = {
  selectedSports: [] as string[],
  selectedTeams: {} as Record<string, string[]>,
  teamDetails: {} as Record<string, { name: string; badge: string; leagueId: string; leagueName: string; sport: string }>,
  calendarEventIds: {} as Record<string, Record<string, string>>,
};
