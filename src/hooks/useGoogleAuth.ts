"use client";

import { useState, useEffect, useCallback } from "react";

export function useGoogleAuth() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if google_connected cookie exists
    setIsConnected(document.cookie.includes("google_connected=true"));
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/calendar/google/auth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/calendar/google/logout", { method: "POST" });
      setIsConnected(false);
    } catch (err) {
      console.error("Failed to disconnect Google Calendar:", err);
    }
  }, []);

  const addToGoogleCalendar = useCallback(async (matchData: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/google/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: matchData,
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "not_authenticated") {
          connect();
          return false;
        }
        throw new Error(data.error || "Failed to add event");
      }
      return true;
    } catch (err) {
      console.error("Failed to add to Google Calendar:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [connect]);

  return { isConnected, loading, connect, disconnect, addToGoogleCalendar };
}
