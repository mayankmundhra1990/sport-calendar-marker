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
  const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = match.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="sticky top-[57px] z-10 bg-gray-50/95 backdrop-blur-sm text-xs font-semibold text-gray-500 uppercase tracking-wide py-1.5 mb-1.5 -mx-4 px-4">
            {formatDateHeader(date)}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {grouped[date].map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
