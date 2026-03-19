"use client";

import { useState, useEffect, useMemo } from "react";
import type { Match } from "@/lib/types";
import { SPORTS, TENNIS_LEAGUE_IDS, LEAGUE_CONFIG_MAP } from "@/lib/constants";
import { usePreferencesContext } from "@/context/PreferencesContext";

export function useEvents(sportFilter?: string, teamFilter?: string | null) {
  const { preferences } = usePreferencesContext();
  const [allEvents, setAllEvents] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // Collect league configs that contain selected teams
  const relevantLeagues = useMemo(() => {
    const leagues: { id: string; season: string; totalRounds: number }[] = [];
    const seenIds = new Set<string>();

    for (const sport of SPORTS) {
      const selectedTeamIds = preferences.selectedTeams[sport.id] || [];
      if (selectedTeamIds.length === 0) continue;

      // Get leagueIds from team details
      const teamLeagueIds = new Set(
        selectedTeamIds
          .map((tid) => preferences.teamDetails[tid]?.leagueId)
          .filter(Boolean)
      );

      for (const league of sport.leagues) {
        if (teamLeagueIds.has(league.id) && !seenIds.has(league.id)) {
          seenIds.add(league.id);
          leagues.push({ id: league.id, season: league.season, totalRounds: league.totalRounds });
        }
      }
    }

    // Handle teams from leagues not in SPORTS config (e.g. followed via search)
    // Scan all teamDetails for unresolved league IDs
    const allTeamLeagueIds = new Set(
      Object.values(preferences.teamDetails)
        .map((d) => d.leagueId)
        .filter(Boolean)
    );
    for (const lid of allTeamLeagueIds) {
      if (seenIds.has(lid) || TENNIS_LEAGUE_IDS.has(lid)) continue;
      const config = LEAGUE_CONFIG_MAP[lid];
      leagues.push({
        id: lid,
        season: config?.season ?? "2025-2026",
        totalRounds: config?.totalRounds ?? 38,
      });
      seenIds.add(lid);
    }

    // Deduplicate tennis leagues: AllSportsAPI returns all ATP + WTA fixtures in one call
    let hasTennis = false;
    return leagues.filter((league) => {
      if (TENNIS_LEAGUE_IDS.has(league.id)) {
        if (hasTennis) return false;
        hasTennis = true;
      }
      return true;
    });
  }, [preferences]);

  useEffect(() => {
    if (relevantLeagues.length === 0) {
      setAllEvents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(
      relevantLeagues.map((league) =>
        fetch(`/api/sports/events?leagueId=${league.id}&season=${encodeURIComponent(league.season)}&totalRounds=${league.totalRounds}`)
          .then((res) => res.json())
          .catch(() => [])
      )
    )
      .then((results) => {
        if (cancelled) return;
        const events = results.flat() as Match[];
        setAllEvents(events);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [relevantLeagues, refetchKey]);

  // Filter events to only include upcoming matches involving selected teams/players
  const filteredEvents = useMemo(() => {
    const allSelectedTeamIds = new Set(
      Object.values(preferences.selectedTeams).flat()
    );
    // Collect match keywords for tennis players (keyword → lowercase for matching)
    const tennisKeywords = Object.values(preferences.teamDetails)
      .filter((d) => d.sport === "tennis" && d.matchKeyword)
      .map((d) => d.matchKeyword!.toLowerCase());

    const today = new Date().toISOString().split("T")[0];

    // If filtering by a specific team/player, get its keyword
    const activeTeamKeyword = teamFilter
      ? preferences.teamDetails[teamFilter]?.matchKeyword?.toLowerCase()
      : null;

    return allEvents
      .filter((match) => {
        let teamMatch: boolean;
        if (match.sport === "tennis") {
          // Tennis: match by player keyword in player names and title
          const searchText = [match.homeTeam.name, match.awayTeam.name, match.title]
            .join(" ")
            .toLowerCase();
          if (teamFilter && activeTeamKeyword) {
            // Specific tennis player filter
            teamMatch = searchText.includes(activeTeamKeyword);
          } else if (teamFilter && !activeTeamKeyword) {
            // A non-tennis team is selected → exclude all tennis matches
            teamMatch = false;
          } else {
            teamMatch = tennisKeywords.some((kw) => searchText.includes(kw));
          }
        } else {
          if (teamFilter) {
            // Specific team filter (non-tennis): match by team ID
            // If teamFilter is a tennis player, their ID won't match any football/basketball team,
            // so non-tennis matches are correctly excluded.
            teamMatch =
              match.homeTeam.id === teamFilter ||
              match.awayTeam.id === teamFilter;
          } else {
            teamMatch =
              allSelectedTeamIds.has(match.homeTeam.id) ||
              allSelectedTeamIds.has(match.awayTeam.id);
          }
        }
        const sportMatch = !sportFilter || sportFilter === "all" || match.sport === sportFilter;
        const upcoming = match.date >= today;
        return teamMatch && sportMatch && upcoming;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [allEvents, preferences.selectedTeams, preferences.teamDetails, sportFilter, teamFilter]);

  const refetch = () => setRefetchKey((k) => k + 1);

  return { events: filteredEvents, loading, error, refetch };
}
