"use client";

import { useState } from "react";
import type { Match } from "@/lib/types";
import { Download, Check, AlertCircle } from "lucide-react";

interface CalendarButtonsProps {
  match: Match;
  isSynced: boolean;
}

export default function CalendarButtons({ match, isSynced }: CalendarButtonsProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownloadIcs = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError(false);
    try {
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
      const res = await fetch(`/api/calendar/ics?${params.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${match.homeTeam.name.replace(/\s+/g, "-")}-vs-${match.awayTeam.name.replace(/\s+/g, "-")}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      setDownloadError(true);
      setTimeout(() => setDownloadError(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {isSynced && (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium" aria-live="polite">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          Synced to Google
        </span>
      )}
      {!isSynced && (
        <button
          onClick={handleDownloadIcs}
          disabled={downloading}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60 relative before:absolute before:inset-[-6px] before:content-['']"
          aria-label={`Download .ics calendar file for ${match.homeTeam.name} vs ${match.awayTeam.name}`}
          title="Download .ics file — works with Apple Calendar, Outlook, and any calendar app"
        >
          <span className="flex items-center gap-1.5" aria-live="polite">
            {downloaded ? (
              <><Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" /><span className="text-green-600">Downloaded!</span></>
            ) : downloadError ? (
              <><AlertCircle className="w-3.5 h-3.5 text-red-500" aria-hidden="true" /><span className="text-red-500">Failed — retry</span></>
            ) : (
              <><Download className="w-3.5 h-3.5" aria-hidden="true" />Add to Calendar</>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
