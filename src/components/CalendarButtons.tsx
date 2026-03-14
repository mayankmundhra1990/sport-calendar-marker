"use client";

import type { Match } from "@/lib/types";
import { Download, Check } from "lucide-react";

interface CalendarButtonsProps {
  match: Match;
  isSynced: boolean;
}

export default function CalendarButtons({ match, isSynced }: CalendarButtonsProps) {
  const handleDownloadIcs = () => {
    const params = new URLSearchParams({
      matchId: match.id,
      title: match.title,
      date: match.date,
      time: match.time,
      dateTime: match.dateTime || "",
      venue: match.venue,
      sport: match.sport,
      league: match.leagueName,
      round: match.round,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
    });
    window.open(`/api/calendar/ics?${params.toString()}`, "_blank");
  };

  return (
    <div className="flex gap-2 items-center">
      {isSynced && (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <Check className="w-3.5 h-3.5" />
          Synced
        </span>
      )}
      <button
        onClick={handleDownloadIcs}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        title="Download .ics file"
      >
        <Download className="w-3.5 h-3.5" />
        .ics
      </button>
    </div>
  );
}
