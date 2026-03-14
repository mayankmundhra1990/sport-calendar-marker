"use client";

import { useCallback, useState } from "react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { SPORTS } from "@/lib/constants";
import type { Team } from "@/lib/types";

export interface SyncStatus {
  teamId: string;
  status: "syncing" | "success" | "error" | "no_matches";
  message?: string;
  matchCount?: number;
}

export function useCalendarSync() {
  const {
    addTeam,
    removeTeam,
    preferences,
    addCalendarEventIds,
    clearCalendarEventIdsForTeam,
  } = usePreferencesContext();
  const { isConnected } = useGoogleAuth();
  const [syncStatuses, setSyncStatuses] = useState<Record<string, SyncStatus>>({});

  const addTeamWithSync = useCallback(
    async (team: Team) => {
      // 1. Add team to preferences immediately (optimistic)
      addTeam(team);

      // 2. If not connected to Google, skip sync
      if (!isConnected) return;

      // 3. Find the league season from SPORTS constant
      const leagueConfig = SPORTS.flatMap((s) => s.leagues).find(
        (l) => l.id === team.leagueId
      );

      if (!leagueConfig) return;

      // 4. Set syncing status
      setSyncStatuses((prev) => ({
        ...prev,
        [team.id]: { teamId: team.id, status: "syncing" },
      }));

      try {
        // 5. Call bulk-add API
        const res = await fetch("/api/calendar/google/bulk-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: team.id,
            leagueId: team.leagueId,
            season: leagueConfig.season,
            sport: team.sport,
            ...(team.matchKeyword ? { matchKeyword: team.matchKeyword } : {}),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to sync");
        }

        const data = await res.json();

        // 6. Store event IDs in preferences
        if (data.eventIds && Object.keys(data.eventIds).length > 0) {
          addCalendarEventIds(team.id, data.eventIds);
        }

        // 7. Update status
        const matchCount = data.matchesSynced || 0;
        setSyncStatuses((prev) => ({
          ...prev,
          [team.id]: {
            teamId: team.id,
            status: matchCount > 0 ? "success" : "no_matches",
            matchCount,
            message:
              matchCount > 0
                ? `${matchCount} match${matchCount > 1 ? "es" : ""} synced`
                : "No upcoming matches found",
          },
        }));
      } catch (err) {
        setSyncStatuses((prev) => ({
          ...prev,
          [team.id]: {
            teamId: team.id,
            status: "error",
            message: err instanceof Error ? err.message : "Sync failed",
          },
        }));
      }
    },
    [addTeam, isConnected, addCalendarEventIds]
  );

  const removeTeamWithSync = useCallback(
    async (teamId: string) => {
      // 1. Get the event IDs before removing
      const teamEventIds = preferences.calendarEventIds[teamId] || {};
      const googleEventIds = Object.values(teamEventIds);

      // 2. Remove team from preferences immediately (optimistic)
      removeTeam(teamId);
      clearCalendarEventIdsForTeam(teamId);

      // 3. Clear sync status
      setSyncStatuses((prev) => {
        const newStatuses = { ...prev };
        delete newStatuses[teamId];
        return newStatuses;
      });

      // 4. If no event IDs to delete or not connected, skip
      if (googleEventIds.length === 0 || !isConnected) return;

      // 5. Fire-and-forget: delete calendar events in background
      fetch("/api/calendar/google/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds: googleEventIds }),
      }).catch((err) => {
        console.error("Failed to remove calendar events:", err);
      });
    },
    [removeTeam, preferences.calendarEventIds, isConnected, clearCalendarEventIdsForTeam]
  );

  return { addTeamWithSync, removeTeamWithSync, syncStatuses };
}
