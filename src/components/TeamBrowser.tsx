"use client";

import { useState, useEffect, useCallback } from "react";
import type { Team } from "@/lib/types";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import TeamCard from "./TeamCard";
import { Search, RefreshCw } from "lucide-react";

interface TeamBrowserProps {
  leagueName: string;
}

// Skeleton loader for team cards
function TeamCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 bg-gray-200 animate-pulse rounded w-3/4" />
        <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
      </div>
      <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
    </div>
  );
}

export default function TeamBrowser({ leagueName }: TeamBrowserProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const { addTeamWithSync, removeTeamWithSync, syncStatuses } = useCalendarSync();

  const fetchTeams = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/sports/teams?league=${encodeURIComponent(leagueName)}`)
      .then((res) => res.json())
      .then((data) => {
        setTeams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [leagueName]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const filtered = teams
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.popularity - a.popularity);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <line x1="1" y1="1" x2="23" y2="23" strokeWidth={1.5} />
        </svg>
        <p className="text-sm font-semibold text-gray-600 mb-1">Couldn&apos;t load teams</p>
        <p className="text-xs text-gray-400 mb-4">This might be a temporary issue. Please try again.</p>
        <button
          onClick={fetchTeams}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          placeholder={`Filter teams in ${leagueName}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`Filter teams in ${leagueName}`}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No teams match &ldquo;{search}&rdquo;</p>
          <button
            onClick={() => setSearch("")}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Clear filter
          </button>
        </div>
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
