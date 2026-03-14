"use client";

import { use, useState } from "react";
import { SPORTS } from "@/lib/constants";
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
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to sports
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {sport.icon} {sport.name}
        </h1>
        <p className="text-gray-500 mt-1">
          {sportId === "tennis" ? "Select players to follow" : "Select teams to follow"}
        </p>
      </div>

      {sportId === "tennis" ? (
        <PlayerBrowser />
      ) : (
        <>
          {/* Global team search */}
          <TeamSearch sport={sportId} />

          {/* Divider between search and browse */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wide">
                or browse by league
              </span>
            </div>
          </div>

          {/* League picker + team browser */}
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
