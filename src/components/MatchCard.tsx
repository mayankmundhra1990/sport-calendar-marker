"use client";

import type { Match } from "@/lib/types";
import { format, isPast } from "date-fns";
import { usePreferencesContext } from "@/context/PreferencesContext";
import CalendarButtons from "./CalendarButtons";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import { SPORT_COLORS } from "@/lib/constants";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { preferences } = usePreferencesContext();
  const matchDate = new Date(match.dateTime || `${match.date}T${match.time}Z`);
  const timeStr = format(matchDate, "HH:mm");
  const tzAbbr = new Intl.DateTimeFormat("default", { timeZoneName: "short" })
    .formatToParts(matchDate)
    .find((p) => p.type === "timeZoneName")?.value ?? "";
  const past = isPast(matchDate);
  const sportColor = SPORT_COLORS[match.sport]?.accent ?? "#2563eb";

  const isSynced = Object.values(preferences.calendarEventIds).some(
    (teamEvents) => match.id in teamEvents
  );

  const dateLabel = format(matchDate, "EEE, MMM d");

  return (
    <article
      className={clsx(
        "rounded-xl border transition-shadow overflow-hidden",
        past ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-200 bg-white hover:shadow-sm"
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: sportColor }}
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}, ${dateLabel} at ${timeStr}, ${match.leagueName}`}
    >
      <div className="p-4">
        {/* Time + League row */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div>
            <span className={clsx("text-xl font-bold tabular-nums", past ? "text-gray-400" : "text-gray-900")}>
              {timeStr}
            </span>
            {tzAbbr && (
              <span className="text-xs text-gray-500 ml-1">{tzAbbr}</span>
            )}
            <div className="h-0.5 w-8 mt-0.5 rounded-full" style={{ background: past ? "#d1d5db" : sportColor }} />
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 whitespace-nowrap">
            {match.leagueName}
          </span>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative w-8 h-8 flex-shrink-0">
              {match.homeTeam.badge && (
                <img
                  src={match.homeTeam.badge}
                  alt=""
                  className="w-8 h-8 object-contain absolute inset-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                {match.homeTeam.name[0]}
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {match.homeTeam.name}
            </span>
          </div>

          <span className="text-xs text-gray-400 font-medium flex-shrink-0">
            <span aria-hidden="true">vs</span>
            <span className="sr-only">versus</span>
          </span>

          <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
            <div className="relative w-8 h-8 flex-shrink-0">
              {match.awayTeam.badge && (
                <img
                  src={match.awayTeam.badge}
                  alt=""
                  className="w-8 h-8 object-contain absolute inset-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                {match.awayTeam.name[0]}
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 truncate text-right">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Venue — always visible */}
        {match.venue && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs text-gray-500 truncate">{match.venue}</span>
          </div>
        )}

        {/* Actions */}
        {past ? (
          <span className="text-xs text-gray-400 italic">Played</span>
        ) : (
          <CalendarButtons match={match} isSynced={isSynced} />
        )}
      </div>
    </article>
  );
}
