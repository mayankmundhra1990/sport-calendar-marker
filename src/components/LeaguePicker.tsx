"use client";

import { useState } from "react";
import type { LeagueConfig } from "@/lib/types";
import { Search } from "lucide-react";
import clsx from "clsx";

interface LeaguePickerProps {
  leagues: LeagueConfig[];
  selected: string;
  onSelect: (leagueId: string) => void;
}

export default function LeaguePicker({ leagues, selected, onSelect }: LeaguePickerProps) {
  const [filter, setFilter] = useState("");
  const showFilter = leagues.length > 6;

  const filtered = filter
    ? leagues.filter(
        (l) =>
          l.name.toLowerCase().includes(filter.toLowerCase()) ||
          l.country.toLowerCase().includes(filter.toLowerCase())
      )
    : leagues;

  return (
    <div>
      {showFilter && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter leagues..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {filtered.map((league) => (
          <button
            key={league.id}
            onClick={() => onSelect(league.id)}
            className={clsx(
              "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selected === league.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {league.name}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 py-2">No leagues match &ldquo;{filter}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
