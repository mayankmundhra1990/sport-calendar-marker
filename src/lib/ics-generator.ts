import { createEvent, createEvents, type EventAttributes } from "ics";
import type { Match } from "./types";
import { DURATION_MINUTES } from "./constants";

function matchToIcsAttributes(match: Match): EventAttributes {
  const dt = new Date(match.dateTime || `${match.date}T${match.time}Z`);
  const duration = DURATION_MINUTES[match.sport] || 120;

  return {
    start: [dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes()],
    duration: { minutes: duration },
    title: match.title,
    description: `${match.leagueName} - Round ${match.round}\n${match.homeTeam.name} vs ${match.awayTeam.name}`,
    location: match.venue,
    status: "CONFIRMED" as const,
    startInputType: "utc" as const,
    startOutputType: "utc" as const,
    categories: [match.sport, match.leagueName],
    alarms: [{ action: "display", trigger: { minutes: 30, before: true }, description: `${match.title} starts in 30 minutes` }],
  };
}

export function generateSingleIcs(match: Match): string {
  const { error, value } = createEvent(matchToIcsAttributes(match));
  if (error) throw new Error(`Failed to generate ICS: ${error}`);
  return value!;
}

export function generateMultipleIcs(matches: Match[]): string {
  if (matches.length === 0) {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sport Calendar Marker//EN",
      "X-WR-CALNAME:Sport Calendar",
      "END:VCALENDAR",
    ].join("\r\n");
  }
  const { error, value } = createEvents(matches.map(matchToIcsAttributes));
  if (error) throw new Error(`Failed to generate ICS feed: ${error}`);
  return value!;
}
