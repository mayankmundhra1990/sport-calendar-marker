"use client";

import { useState } from "react";
import { TENNIS_PLAYERS } from "@/lib/constants";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import TeamCard from "./TeamCard";
import { Search } from "lucide-react";
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
  const { addTeamWithSync, removeTeamWithSync, syncStatuses } = useCalendarSync();

  const filtered = TENNIS_PLAYERS
    .filter((p) => p.tour === tour)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["atp", "wta"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTour(t)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
