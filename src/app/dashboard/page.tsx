"use client";

import { useState, useMemo } from "react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { useEvents } from "@/hooks/useEvents";
import Link from "next/link";
import MatchList from "@/components/MatchList";
import EmptyState from "@/components/EmptyState";
import SubscribeButton from "@/components/SubscribeButton";
import FollowedTeams from "@/components/FollowedTeams";
import { SPORTS } from "@/lib/constants";
import { CheckCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";

const FILTERS = [{ id: "all", label: "All" }, ...SPORTS.map((s) => ({ id: s.id, label: s.name }))];

// Skeleton for match cards
function MatchSkeleton() {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-2.5 overflow-hidden">
      <div className="flex items-start justify-between mb-1.5 gap-1">
        <div className="h-4 w-10 bg-gray-200 animate-pulse rounded" />
        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1 flex-1">
          <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="h-3 w-14 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-2.5 w-4 bg-gray-200 animate-pulse rounded" />
        <div className="flex items-center gap-1 flex-1 flex-row-reverse">
          <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="h-3 w-14 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="h-5 w-20 bg-gray-200 animate-pulse rounded-md" />
    </div>
  );
}

export default function Dashboard() {
  const { preferences } = usePreferencesContext();
  const [sportFilter, setSportFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const { events, loading, error, refetch } = useEvents(sportFilter, teamFilter);

  // Detect filter conflict: team selected but incompatible sport filter active
  const activeTeamSport = teamFilter ? preferences.teamDetails[teamFilter]?.sport : null;
  const hasFilterConflict = !loading && !error && events.length === 0 && teamFilter !== null && sportFilter !== "all" && activeTeamSport !== sportFilter;

  const totalTeams = Object.values(preferences.selectedTeams).flat().length;

  const syncedCount = useMemo(() => {
    let count = 0;
    for (const teamEvents of Object.values(preferences.calendarEventIds)) {
      count += Object.keys(teamEvents).length;
    }
    return count;
  }, [preferences.calendarEventIds]);

  if (totalTeams === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Upcoming Matches</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-500 text-xs">
              {totalTeams} team{totalTeams > 1 ? "s" : ""} followed
            </p>
            {syncedCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                {syncedCount} synced
              </span>
            )}
          </div>
        </div>
        <SubscribeButton />
      </div>

      <FollowedTeams activeTeamId={teamFilter} onSelectTeam={(id) => setTeamFilter(teamFilter === id ? null : id)} />

      {/* Sport filter tabs */}
      <div className="relative mb-6">
        <div
          className="flex gap-2 overflow-x-auto pb-2 pr-8"
          role="radiogroup"
          aria-label="Filter matches by sport"
          onKeyDown={(e) => {
            const idx = FILTERS.findIndex((f) => f.id === sportFilter);
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              setSportFilter(FILTERS[(idx + 1) % FILTERS.length].id);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              setSportFilter(FILTERS[(idx - 1 + FILTERS.length) % FILTERS.length].id);
            }
          }}
        >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={sportFilter === f.id}
            tabIndex={sportFilter === f.id ? 0 : -1}
            onClick={() => setSportFilter(f.id)}
            className={clsx(
              "whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              sportFilter === f.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f.label}
          </button>
        ))}
        </div>
        {/* Scroll fade affordance */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" aria-hidden="true" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <MatchSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-amber-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm font-semibold text-gray-600 mb-1">Couldn&apos;t load matches</p>
          <p className="text-xs text-gray-500 mb-4">Something went wrong. Please try again.</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      ) : hasFilterConflict ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-10 h-10 text-amber-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 8.907 3.007" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12h6m-3-3 3 3-3 3" />
          </svg>
          <p className="text-sm font-semibold text-gray-600 mb-1">Filter conflict</p>
          <p className="text-xs text-gray-500 mb-4 max-w-xs">The selected team and sport filter don&apos;t match. Try clearing one.</p>
          <button
            onClick={() => setSportFilter("all")}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Show all sports for this team →
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm font-semibold text-gray-600 mb-1">No upcoming matches</p>
          <p className="text-xs text-gray-500 mb-3">Matches will appear here as they&apos;re scheduled.</p>
          <Link href="/" className="text-xs text-blue-600 hover:underline font-medium">Follow more teams →</Link>
        </div>
      ) : (
        <MatchList matches={events} />
      )}
    </div>
  );
}
