"use client";

import { useEffect, useRef } from "react";
import { usePreferencesContext } from "@/context/PreferencesContext";

/**
 * Silently syncs the user's followed teams to Supabase whenever they change,
 * but only while Google Calendar is connected. This gives the daily cron job
 * an up-to-date list of teams to auto-sync new fixtures for.
 */
export default function ServerSyncProvider() {
  const { preferences } = usePreferencesContext();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (!document.cookie.includes("google_connected=true")) return;

    const key = JSON.stringify(preferences.teamDetails);
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const teams = Object.entries(preferences.teamDetails).map(([id, d]) => ({
        teamId: id,
        teamName: d.name,
        sport: d.sport,
        leagueId: d.leagueId,
        leagueName: d.leagueName,
        badge: d.badge,
        matchKeyword: d.matchKeyword,
      }));

      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams }),
      }).catch(() => {
        // Fire-and-forget — failures are non-critical
      });
    }, 1000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [preferences.teamDetails]);

  return null;
}
