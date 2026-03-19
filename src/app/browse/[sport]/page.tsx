"use client";

import { use, useState, useEffect } from "react";
import { SPORTS, SPORT_COLORS } from "@/lib/constants";
import LeaguePicker from "@/components/LeaguePicker";
import TeamBrowser from "@/components/TeamBrowser";
import PlayerBrowser from "@/components/PlayerBrowser";
import TeamSearch from "@/components/TeamSearch";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BrowseSport({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: sportId } = use(params);
  const sport = SPORTS.find((s) => s.id === sportId);
  const [selectedLeagueId, setSelectedLeagueId] = useState(sport?.leagues[0]?.id || "");
  const color = SPORT_COLORS[sportId] ?? SPORT_COLORS["football"];

  // Dynamic page title
  useEffect(() => {
    if (sport) {
      document.title = `${sport.name} Teams & Leagues — Sport Calendar Marker`;
    }
    return () => { document.title = "Sport Calendar Marker — Never Miss a Match"; };
  }, [sport]);

  if (!sport) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Sport not found</p>
        <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  const selectedLeague = sport.leagues.find((l) => l.id === selectedLeagueId);

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 -ml-3 mb-3 min-h-[44px] transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to sports
      </Link>

      {/* Sport header with accent */}
      <div
        className="rounded-xl p-5 mb-6 border"
        style={{
          background: `linear-gradient(135deg, ${color.accent}0d 0%, #ffffff 100%)`,
          borderColor: `${color.accent}30`,
          borderLeftWidth: 4,
          borderLeftColor: color.accent,
        }}
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span aria-hidden="true">{sport.icon}</span> {sport.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: color.accent }}>
          {sportId === "tennis" ? "Select players to follow" : `${sport.leagues.length} leagues available`}
        </p>
      </div>

      {sportId === "tennis" ? (
        <PlayerBrowser />
      ) : (
        <>
          <TeamSearch sport={sportId} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-3 text-xs text-gray-400 uppercase tracking-wide">
                or browse by league
              </span>
            </div>
          </div>

          <div className="mb-6">
            <LeaguePicker
              leagues={sport.leagues}
              selected={selectedLeagueId}
              onSelect={setSelectedLeagueId}
            />
          </div>
          {selectedLeague && <TeamBrowser leagueName={selectedLeague.name} />}
        </>
      )}
    </div>
  );
}
