"use client";

import { useState, useRef } from "react";
import { TENNIS_PLAYERS } from "@/lib/constants";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import TeamCard from "./TeamCard";
import { Search, X } from "lucide-react";
import type { Team, TennisPlayer } from "@/lib/types";
import clsx from "clsx";

function playerToTeam(player: TennisPlayer): Team {
  const leagueName = player.tour === "atp" ? "ATP World Tour" : "WTA Tour";
  return {
    id: player.id,
    name: player.name,
    shortName: player.keyword,
    badge: "",
    sport: "tennis",
    leagueId: player.leagueId,
    leagueName,
    stadium: "",
    country: player.country,
    popularity: 0,
    matchKeyword: player.keyword,
  };
}

export default function PlayerBrowser() {
  const [tour, setTour] = useState<"atp" | "wta">("atp");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { addTeamWithSync, removeTeamWithSync, syncStatuses } = useCalendarSync();

  const filtered = TENNIS_PLAYERS
    .filter((p) => p.tour === tour)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Select tour">
        {(["atp", "wta"] as const).map((t) => (
          <button
            key={t}
            role="radio"
            aria-checked={tour === t}
            onClick={() => setTour(t)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px]",
              tour === t
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); searchRef.current?.blur(); } }}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search tennis players"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); searchRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-gray-600"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Clear player search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No players found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((player) => (
            <TeamCard
              key={player.id}
              team={playerToTeam(player)}
              syncStatus={syncStatuses[player.id]}
              onAdd={addTeamWithSync}
              onRemove={removeTeamWithSync}
            />
          ))}
        </div>
      )}
    </div>
  );
}
