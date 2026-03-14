"use client";

import { useState, useMemo } from "react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { useEvents } from "@/hooks/useEvents";
import MatchList from "@/components/MatchList";
import EmptyState from "@/components/EmptyState";
import SubscribeButton from "@/components/SubscribeButton";
import FollowedTeams from "@/components/FollowedTeams";
import { SPORTS } from "@/lib/constants";
import { Loader2, CheckCircle } from "lucide-react";
import clsx from "clsx";

const FILTERS = [{ id: "all", label: "All" }, ...SPORTS.map((s) => ({ id: s.id, label: s.name }))];

export default function Dashboard() {
  const { preferences } = usePreferencesContext();
  const [sportFilter, setSportFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const { events, loading, error } = useEvents(sportFilter, teamFilter);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Matches</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">
              {totalTeams} team{totalTeams > 1 ? "s" : ""} followed
            </p>
            {syncedCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                {syncedCount} match{syncedCount > 1 ? "es" : ""} synced
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SubscribeButton />
        </div>
      </div>

      <FollowedTeams activeTeamId={teamFilter} onSelectTeam={(id) => setTeamFilter(teamFilter === id ? null : id)} />

      {/* Sport filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Loading matches...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          Failed to load matches. Please try again.
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No upcoming matches found for your selected teams.
        </div>
      ) : (
        <MatchList matches={events} />
      )}
    </div>
  );
}
