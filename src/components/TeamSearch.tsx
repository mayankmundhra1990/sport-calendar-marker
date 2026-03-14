"use client";

import { useState, useEffect, useRef } from "react";
import type { Team } from "@/lib/types";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import TeamCard from "./TeamCard";
import { Search, Loader2, X } from "lucide-react";

interface TeamSearchProps {
  sport?: string;
}

export default function TeamSearch({ sport }: TeamSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { addTeamWithSync, removeTeamWithSync, syncStatuses } = useCalendarSync();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setHasSearched(true);

    const params = new URLSearchParams({ q: debouncedQuery });
    if (sport) params.set("sport", sport);

    fetch(`/api/sports/search?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, sport]);

  const isActive = query.length > 0;

  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for any team or club..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
        {isActive && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isActive && (
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No teams found for &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : results.length > 0 ? (
            <>
              <p className="text-xs text-gray-500 mb-3">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((team) => (
                  <div key={team.id} className="relative">
                    <TeamCard
                      team={team}
                      syncStatus={syncStatuses[team.id]}
                      onAdd={addTeamWithSync}
                      onRemove={removeTeamWithSync}
                    />
                    {/* League badge overlay */}
                    <span className="absolute top-1 right-9 text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {team.leagueName}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
