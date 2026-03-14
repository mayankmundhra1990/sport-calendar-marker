"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserPreferences, Team } from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import { loadPreferences, savePreferences } from "@/lib/storage";

interface PreferencesContextType {
  preferences: UserPreferences;
  addTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  isTeamSelected: (teamId: string) => boolean;
  clearAll: () => void;
  addCalendarEventIds: (teamId: string, ids: Record<string, string>) => void;
  clearCalendarEventIdsForTeam: (teamId: string) => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) savePreferences(preferences);
  }, [preferences, loaded]);

  const addTeam = useCallback((team: Team) => {
    setPreferences((prev) => {
      const sportTeams = prev.selectedTeams[team.sport] || [];
      if (sportTeams.includes(team.id)) return prev;

      const selectedSports = prev.selectedSports.includes(team.sport)
        ? prev.selectedSports
        : [...prev.selectedSports, team.sport];

      return {
        ...prev,
        selectedSports,
        selectedTeams: {
          ...prev.selectedTeams,
          [team.sport]: [...sportTeams, team.id],
        },
        teamDetails: {
          ...prev.teamDetails,
          [team.id]: {
            name: team.name,
            badge: team.badge,
            leagueId: team.leagueId,
            leagueName: team.leagueName,
            sport: team.sport,
            ...(team.matchKeyword ? { matchKeyword: team.matchKeyword } : {}),
          },
        },
      };
    });
  }, []);

  const removeTeam = useCallback((teamId: string) => {
    setPreferences((prev) => {
      const details = prev.teamDetails[teamId];
      if (!details) return prev;

      const sportTeams = (prev.selectedTeams[details.sport] || []).filter((id) => id !== teamId);
      const selectedSports = sportTeams.length === 0
        ? prev.selectedSports.filter((s) => s !== details.sport)
        : prev.selectedSports;

      const newTeamDetails = { ...prev.teamDetails };
      delete newTeamDetails[teamId];

      return {
        ...prev,
        selectedSports,
        selectedTeams: {
          ...prev.selectedTeams,
          [details.sport]: sportTeams,
        },
        teamDetails: newTeamDetails,
      };
    });
  }, []);

  const isTeamSelected = useCallback(
    (teamId: string) => !!preferences.teamDetails[teamId],
    [preferences.teamDetails]
  );

  const clearAll = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const addCalendarEventIds = useCallback((teamId: string, ids: Record<string, string>) => {
    setPreferences((prev) => ({
      ...prev,
      calendarEventIds: {
        ...prev.calendarEventIds,
        [teamId]: { ...(prev.calendarEventIds[teamId] || {}), ...ids },
      },
    }));
  }, []);

  const clearCalendarEventIdsForTeam = useCallback((teamId: string) => {
    setPreferences((prev) => {
      const newIds = { ...prev.calendarEventIds };
      delete newIds[teamId];
      return { ...prev, calendarEventIds: newIds };
    });
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        addTeam,
        removeTeam,
        isTeamSelected,
        clearAll,
        addCalendarEventIds,
        clearCalendarEventIdsForTeam,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferencesContext() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferencesContext must be used within PreferencesProvider");
  return ctx;
}
