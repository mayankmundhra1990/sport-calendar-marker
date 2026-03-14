"use client";

import { useState, useEffect } from "react";
import type { Team } from "@/lib/types";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import TeamCard from "./TeamCard";
import { Search, Loader2 } from "lucide-react";

interface TeamBrowserProps {
  leagueName: string;
}

export default function TeamBrowser({ leagueName }: TeamBrowserProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addTeamWithSync, removeTeamWithSync, syncStatuses } = useCalendarSync();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sports/teams?league=${encodeURIComponent(leagueName)}`)
      .then((res) => res.json())
      .then((data) => {
        setTeams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTeams([]);
        setLoading(false);
      });
  }, [leagueName]);

  const filtered = teams
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.popularity - a.popularity);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Loading teams...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No teams found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              syncStatus={syncStatuses[team.id]}
              onAdd={addTeamWithSync}
              onRemove={removeTeamWithSync}
            />
          ))}
        </div>
      )}
    </div>
  );
}
