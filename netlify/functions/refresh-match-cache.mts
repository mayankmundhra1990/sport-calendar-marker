/**
 * Netlify Scheduled Function — runs every 12 hours (midnight & noon UTC).
 *
 * Fetches all match fixtures from TheSportsDB and AllSportsAPI,
 * then caches them in Firestore for fast serving to users.
 */
import type { Config } from "@netlify/functions";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAllSeasonEvents } from "../../src/lib/sportsdb";
import { getTennisFixtures } from "../../src/lib/allsportsapi";
import { SPORTS, TENNIS_LEAGUE_IDS } from "../../src/lib/constants";
import type { Match } from "../../src/lib/types";

// ─── Firebase init ──────────────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

// ─── helpers ────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function cacheLeague(leagueId: string, leagueName: string, matches: Match[]) {
  await db.doc(`cached_matches/${leagueId}`).set({
    lastRefreshed: new Date().toISOString(),
    leagueName,
    matchCount: matches.length,
    matches: matches.map((m) => ({ ...m })), // plain objects for Firestore
  });
  console.log(`  ✓ ${leagueName}: ${matches.length} matches cached`);
}

// ─── main handler ────────────────────────────────────────────────────────────

export default async function handler() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("Missing Firebase env vars");
    return;
  }

  console.log("Starting match cache refresh...");
  let totalMatches = 0;
  let leaguesRefreshed = 0;
  let tennisAlreadyFetched = false;

  for (const sport of SPORTS) {
    for (const league of sport.leagues) {
      try {
        if (TENNIS_LEAGUE_IDS.has(league.id)) {
          // Tennis: fetch once from AllSportsAPI, split by league
          if (tennisAlreadyFetched) continue;
          tennisAlreadyFetched = true;

          console.log(`Fetching tennis fixtures (ATP + WTA)...`);
          const allTennis = await getTennisFixtures();

          // Split by leagueId and cache separately
          const atpMatches = allTennis.filter((m) => m.leagueId === "4464");
          const wtaMatches = allTennis.filter((m) => m.leagueId === "4517");

          await cacheLeague("4464", "ATP World Tour", atpMatches);
          await cacheLeague("4517", "WTA Tour", wtaMatches);

          totalMatches += atpMatches.length + wtaMatches.length;
          leaguesRefreshed += 2;
        } else {
          // Football / Basketball / Cricket: fetch from TheSportsDB
          console.log(`Fetching ${league.name}...`);
          const matches = await getAllSeasonEvents(league.id, league.season, league.totalRounds);
          await cacheLeague(league.id, league.name, matches);

          totalMatches += matches.length;
          leaguesRefreshed++;
        }

        // Rate limit delay between leagues
        await delay(500);
      } catch (err) {
        console.error(`Failed to refresh ${league.name} (${league.id}):`, err);
      }
    }
  }

  console.log(`Cache refresh complete: ${leaguesRefreshed} leagues, ${totalMatches} total matches`);
}

export const config: Config = {
  schedule: "0 0,12 * * *", // Midnight and noon UTC
};
