"use client";

import type { Match } from "@/lib/types";
import { format, isPast } from "date-fns";
import { usePreferencesContext } from "@/context/PreferencesContext";
import CalendarButtons from "./CalendarButtons";
import { MapPin } from "lucide-react";
import clsx from "clsx";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { preferences } = usePreferencesContext();
  const matchDate = new Date(match.dateTime || `${match.date}T${match.time}Z`);
  const timeStr = format(matchDate, "HH:mm");
  const dateStr = format(matchDate, "MMM d");
  const past = isPast(matchDate);

  // Check if this match is synced to Google Calendar via any team
  const isSynced = Object.values(preferences.calendarEventIds).some(
    (teamEvents) => match.id in teamEvents
  );

  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border transition-shadow",
        past
          ? "border-gray-100 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white hover:shadow-sm"
      )}
    >
      {/* Date + Time */}
      <div className="flex flex-col items-start w-20 flex-shrink-0">
        <span className="text-xs text-gray-400">{dateStr}</span>
        <span className="text-sm font-mono text-gray-500">{timeStr}</span>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.homeTeam.badge && (
            <img src={match.homeTeam.badge} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {match.homeTeam.name}
          </span>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">vs</span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.awayTeam.badge && (
            <img src={match.awayTeam.badge} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Venue */}
      <div className="hidden md:flex items-center gap-1 text-xs text-gray-400 w-40 flex-shrink-0">
        <MapPin className="w-3 h-3" />
        <span className="truncate">{match.venue}</span>
      </div>

      {/* Calendar status */}
      {past ? (
        <span className="text-xs text-gray-400 italic flex-shrink-0">Played</span>
      ) : (
        <CalendarButtons match={match} isSynced={isSynced} />
      )}
    </div>
  );
}
