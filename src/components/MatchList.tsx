"use client";

import type { Match } from "@/lib/types";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import MatchCard from "./MatchCard";

interface MatchListProps {
  matches: Match[];
}

function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMMM d, yyyy");
}

export default function MatchList({ matches }: MatchListProps) {
  // Group by date
  const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = match.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {formatDateHeader(date)}
          </h3>
          <div className="space-y-2">
            {grouped[date].map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
