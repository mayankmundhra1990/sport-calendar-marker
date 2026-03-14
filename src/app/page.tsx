"use client";

import SportSelector from "@/components/SportSelector";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { CheckCircle, CalendarSync } from "lucide-react";

export default function Home() {
  const { isConnected } = useGoogleAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sport Calendar Marker</h1>
        <p className="text-gray-500 mt-1">
          Sync your favorite teams' match schedules directly to Google Calendar.
        </p>
      </div>

      {!isConnected ? (
        <div className="mb-8 p-8 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 text-center">
          <CalendarSync className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Google Calendar to get started
          </h2>
          <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
            Match schedules will be automatically added to your calendar when you follow teams.
          </p>
          <GoogleAuthButton />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          Google Calendar connected — select teams below to auto-sync their matches.
        </div>
      )}

      <div className={!isConnected ? "opacity-50 pointer-events-none select-none" : ""}>
        <SportSelector />
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
        <a href="/privacy" className="hover:text-gray-600 hover:underline">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
