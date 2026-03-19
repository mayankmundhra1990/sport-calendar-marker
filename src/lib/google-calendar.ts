import { google } from "googleapis";
import type { Match } from "./types";
import { DURATION_MINUTES } from "./constants";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

export async function getTokensFromCode(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(refreshToken: string) {
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

export async function createCalendarEvent(accessToken: string, match: Match): Promise<string> {
  const client = getOAuth2Client();
  client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: client });

  const duration = DURATION_MINUTES[match.sport] || 120;
  const startTime = new Date(match.dateTime || `${match.date}T${match.time}Z`);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const event = {
    summary: match.title,
    location: match.venue,
    description: `${match.leagueName} - Round ${match.round}\n${match.homeTeam.name} vs ${match.awayTeam.name}`,
    start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
    end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 30 }],
    },
  };

  const result = await calendar.events.insert({ calendarId: "primary", requestBody: event });
  return result.data.id!;
}

export async function getGoogleUserInfo(accessToken: string): Promise<{ id: string; email: string }> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user info");
  const data = await res.json();
  return { id: data.id, email: data.email };
}

export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const client = getOAuth2Client();
  client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: client });
  await calendar.events.delete({ calendarId: "primary", eventId });
}

export async function bulkCreateCalendarEvents(
  accessToken: string,
  matches: Match[]
): Promise<{ eventIds: Record<string, string>; errors: string[] }> {
  const eventIds: Record<string, string> = {};
  const errors: string[] = [];

  // Process in batches of 5 to avoid rate limiting
  for (let i = 0; i < matches.length; i += 5) {
    const batch = matches.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map(async (match) => {
        const googleEventId = await createCalendarEvent(accessToken, match);
        return { matchId: match.id, googleEventId };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        eventIds[result.value.matchId] = result.value.googleEventId;
      } else {
        errors.push(result.reason?.message || "Unknown error");
      }
    }
  }

  return { eventIds, errors };
}

export async function bulkDeleteCalendarEvents(
  accessToken: string,
  eventIds: string[]
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (let i = 0; i < eventIds.length; i += 5) {
    const batch = eventIds.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map((eventId) => deleteCalendarEvent(accessToken, eventId))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        deleted++;
      } else {
        failed++; // Event may have been manually deleted -- OK
      }
    }
  }

  return { deleted, failed };
}
