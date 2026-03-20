/**
 * Netlify Scheduled Function — runs daily at 6 AM UTC.
 *
 * For every connected user, fetches upcoming fixtures for their followed teams
 * and creates Google Calendar events for any matches not yet synced.
 */
import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { getAllSeasonEvents } from "../../src/lib/sportsdb";
import { getTennisFixtures } from "../../src/lib/allsportsapi";
import { TENNIS_LEAGUE_IDS, SPORTS, DURATION_MINUTES } from "../../src/lib/constants";
import type { Match } from "../../src/lib/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function refreshToken(refreshToken: string) {
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    return;
  }

  const db = createClient(supabaseUrl, supabaseKey);
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch all users who have a refresh token (i.e. can act on their behalf)
  const { data: users, error: usersError } = await db
    .from("users")
    .select("id, google_id, access_token, refresh_token, token_expiry")
    .not("refresh_token", "is", null);

  if (usersError || !users?.length) {
    console.log("No users to sync or DB error:", usersError?.message);
    return;
  }

  console.log(`Syncing ${users.length} users`);

  // 2. Pre-fetch events for each unique league (shared across all users)
  const { data: allUserTeams } = await db
    .from("user_teams")
    .select("user_id, team_id, sport, league_id, league_name, match_keyword");

  if (!allUserTeams?.length) {
    console.log("No teams to sync");
    return;
  }

  // Build unique league list
  const leagueMap = new Map<string, { leagueId: string; season: string; totalRounds: number; isTennis: boolean }>();
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
      isTennis: false,
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
        await db.from("users").update({
          access_token: accessToken,
          token_expiry: newCreds.expiry_date ?? null,
          updated_at: new Date().toISOString(),
        }).eq("id", user.id);
      }

      // Get this user's teams
      const userTeams = allUserTeams.filter((t) => t.user_id === user.id);
      if (!userTeams.length) continue;

      // Get match IDs already synced for this user
      const { data: synced } = await db
        .from("synced_events")
        .select("match_id")
        .eq("user_id", user.id);
      const syncedMatchIds = new Set((synced ?? []).map((s: { match_id: string }) => s.match_id));

      // Find new matches for each team
      const newEvents: { match: Match; teamId: string }[] = [];

      for (const team of userTeams) {
        let candidates: Match[];

        if (TENNIS_LEAGUE_IDS.has(team.league_id)) {
          // Tennis: match by keyword
          const keyword = team.match_keyword?.toLowerCase();
          if (!keyword) continue;
          candidates = tennisEvents.filter((m) => {
            const text = [m.homeTeam.name, m.awayTeam.name, m.title].join(" ").toLowerCase();
            return text.includes(keyword);
          });
        } else {
          // Team sport: match by team ID
          candidates = (leagueEvents.get(team.league_id) ?? []).filter(
            (m) => m.homeTeam.id === team.team_id || m.awayTeam.id === team.team_id
          );
        }

        for (const match of candidates) {
          if (!syncedMatchIds.has(match.id)) {
            newEvents.push({ match, teamId: team.team_id });
            syncedMatchIds.add(match.id); // avoid duplicates within this batch
          }
        }
      }

      if (!newEvents.length) {
        console.log(`User ${user.id}: no new events`);
        continue;
      }

      console.log(`User ${user.id}: syncing ${newEvents.length} new events`);

      // Create calendar events in batches of 5
      const toInsert: { user_id: string; team_id: string; match_id: string; google_event_id: string; match_date: string }[] = [];

      for (let i = 0; i < newEvents.length; i += 5) {
        const batch = newEvents.slice(i, i + 5);
        const results = await Promise.allSettled(
          batch.map(({ match }) => createCalendarEvent(accessToken, match))
        );
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === "fulfilled") {
            toInsert.push({
              user_id: user.id,
              team_id: batch[j].teamId,
              match_id: batch[j].match.id,
              google_event_id: result.value,
              match_date: batch[j].match.date,
            });
          } else {
            console.error(`Failed to create event ${batch[j].match.id}:`, result.reason);
          }
        }
      }

      if (toInsert.length) {
        await db.from("synced_events").insert(toInsert);
        console.log(`User ${user.id}: inserted ${toInsert.length} synced events`);
      }
    } catch (err) {
      console.error(`Failed processing user ${user.id}:`, err);
      // Continue to next user
    }
  }

  console.log("Sync complete");
}

export const config: Config = {
  schedule: "0 6 * * *", // 6 AM UTC daily
};
