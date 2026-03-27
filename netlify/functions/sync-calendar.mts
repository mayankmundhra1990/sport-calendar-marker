/**
 * Netlify Scheduled Function — runs daily at 6 AM UTC.
 *
 * For every connected user, fetches upcoming fixtures for their followed teams
 * and creates Google Calendar events for any matches not yet synced.
 */
import type { Config } from "@netlify/functions";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { google } from "googleapis";
import { getAllSeasonEvents } from "../../src/lib/sportsdb";
import { getTennisFixtures } from "../../src/lib/allsportsapi";
import { TENNIS_LEAGUE_IDS, SPORTS, DURATION_MINUTES } from "../../src/lib/constants";
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

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function refreshToken(refreshTokenValue: string) {
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshTokenValue });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

async function createCalendarEvent(accessToken: string, match: Match): Promise<string> {
  const client = getOAuth2Client();
  client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: client });

  const duration = DURATION_MINUTES[match.sport] || 120;
  const startTime = new Date(match.dateTime || `${match.date}T${match.time}Z`);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const result = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: match.title,
      location: match.venue,
      description: `${match.leagueName} · Round ${match.round}\n${match.homeTeam.name} vs ${match.awayTeam.name}`,
      start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
      end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
    },
  });
  return result.data.id!;
}

// ─── main handler ────────────────────────────────────────────────────────────

export default async function handler() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("Missing Firebase env vars");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch all users who have a refresh token
  const usersSnap = await db
    .collection("users")
    .where("refresh_token", "!=", null)
    .get();

  if (usersSnap.empty) {
    console.log("No users to sync");
    return;
  }

  const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<{
    id: string;
    access_token: string;
    refresh_token: string;
    token_expiry: number | null;
  }>;

  console.log(`Syncing ${users.length} users`);

  // 2. Pre-fetch teams for all users and build league map
  interface UserTeam {
    user_id: string;
    team_id: string;
    sport: string;
    league_id: string;
    league_name: string;
    match_keyword: string | null;
  }

  const allUserTeams: UserTeam[] = [];

  for (const user of users) {
    const teamsSnap = await db.collection("users").doc(user.id).collection("teams").get();
    for (const doc of teamsSnap.docs) {
      const data = doc.data();
      allUserTeams.push({
        user_id: user.id,
        team_id: doc.id,
        sport: data.sport,
        league_id: data.league_id,
        league_name: data.league_name,
        match_keyword: data.match_keyword ?? null,
      });
    }
  }

  if (!allUserTeams.length) {
    console.log("No teams to sync");
    return;
  }

  // Build unique league list
  const leagueMap = new Map<string, { leagueId: string; season: string; totalRounds: number }>();
  let needsTennis = false;

  for (const team of allUserTeams) {
    if (TENNIS_LEAGUE_IDS.has(team.league_id)) {
      needsTennis = true;
      continue;
    }
    if (leagueMap.has(team.league_id)) continue;
    const leagueConfig = SPORTS.flatMap((s) => s.leagues).find((l) => l.id === team.league_id);
    leagueMap.set(team.league_id, {
      leagueId: team.league_id,
      season: leagueConfig?.season ?? "2025-2026",
      totalRounds: leagueConfig?.totalRounds ?? 38,
    });
  }

  // 3. Fetch events per unique league
  const leagueEvents = new Map<string, Match[]>();

  for (const [leagueId, config] of leagueMap) {
    console.log(`Fetching league ${leagueId}...`);
    try {
      const events = await getAllSeasonEvents(leagueId, config.season, config.totalRounds);
      leagueEvents.set(leagueId, events.filter((e) => e.date >= today));
    } catch (err) {
      console.error(`Failed fetching league ${leagueId}:`, err);
      leagueEvents.set(leagueId, []);
    }
  }

  // Fetch tennis fixtures once if any user follows a tennis player
  let tennisEvents: Match[] = [];
  if (needsTennis) {
    try {
      const all = await getTennisFixtures();
      tennisEvents = all.filter((e) => e.date >= today);
    } catch (err) {
      console.error("Failed fetching tennis fixtures:", err);
    }
  }

  // 4. Process each user
  for (const user of users) {
    try {
      // Refresh token if expired
      let accessToken = user.access_token;
      if (user.token_expiry && Date.now() > user.token_expiry) {
        const newCreds = await refreshToken(user.refresh_token);
        accessToken = newCreds.access_token!;
        await db.collection("users").doc(user.id).update({
          access_token: accessToken,
          token_expiry: newCreds.expiry_date ?? null,
          updated_at: new Date().toISOString(),
        });
      }

      // Get this user's teams
      const userTeams = allUserTeams.filter((t) => t.user_id === user.id);
      if (!userTeams.length) continue;

      // Get match IDs already synced for this user
      const syncedSnap = await db
        .collection("users")
        .doc(user.id)
        .collection("synced_events")
        .get();
      const syncedMatchIds = new Set(syncedSnap.docs.map((doc) => doc.id));

      // Find new matches for each team
      const newEvents: { match: Match; teamId: string }[] = [];

      for (const team of userTeams) {
        let candidates: Match[];

        if (TENNIS_LEAGUE_IDS.has(team.league_id)) {
          const keyword = team.match_keyword?.toLowerCase();
          if (!keyword) continue;
          candidates = tennisEvents.filter((m) => {
            const text = [m.homeTeam.name, m.awayTeam.name, m.title].join(" ").toLowerCase();
            return text.includes(keyword);
          });
        } else {
          candidates = (leagueEvents.get(team.league_id) ?? []).filter(
            (m) => m.homeTeam.id === team.team_id || m.awayTeam.id === team.team_id
          );
        }

        for (const match of candidates) {
          if (!syncedMatchIds.has(match.id)) {
            newEvents.push({ match, teamId: team.team_id });
            syncedMatchIds.add(match.id);
          }
        }
      }

      if (!newEvents.length) {
        console.log(`User ${user.id}: no new events`);
        continue;
      }

      console.log(`User ${user.id}: syncing ${newEvents.length} new events`);

      // Create calendar events in batches of 5
      for (let i = 0; i < newEvents.length; i += 5) {
        const batchItems = newEvents.slice(i, i + 5);
        const results = await Promise.allSettled(
          batchItems.map(({ match }) => createCalendarEvent(accessToken, match))
        );

        const writeBatch = db.batch();
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === "fulfilled") {
            const eventRef = db
              .collection("users")
              .doc(user.id)
              .collection("synced_events")
              .doc(batchItems[j].match.id);
            writeBatch.set(eventRef, {
              team_id: batchItems[j].teamId,
              google_event_id: result.value,
              match_date: batchItems[j].match.date,
              created_at: new Date().toISOString(),
            });
          } else {
            console.error(`Failed to create event ${batchItems[j].match.id}:`, result.reason);
          }
        }
        await writeBatch.commit();
      }

      console.log(`User ${user.id}: sync complete`);
    } catch (err) {
      console.error(`Failed processing user ${user.id}:`, err);
    }
  }

  console.log("Sync complete");
}

export const config: Config = {
  schedule: "0 6 * * *", // 6 AM UTC daily
};
