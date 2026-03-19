"use client";

import Link from "next/link";
import { SPORTS, SPORT_COLORS } from "@/lib/constants";
import { usePreferencesContext } from "@/context/PreferencesContext";

export default function SportSelector() {
  const { preferences } = usePreferencesContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SPORTS.map((sport) => {
        const teamCount = (preferences.selectedTeams[sport.id] || []).length;
        const color = SPORT_COLORS[sport.id];
        return (
          <Link
            key={sport.id}
            href={`/browse/${sport.id}`}
            className="group relative block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all overflow-hidden"
            style={{ borderBottomWidth: 4, borderBottomColor: color.accent }}
          >
            {/* Subtle gradient background */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${color.lightHex} 0%, transparent 60%)` }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="text-4xl mb-3" aria-hidden="true">{sport.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:transition-colors" style={{ color: teamCount > 0 ? color.accent : undefined }}>
                {sport.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {sport.leagues.length} league{sport.leagues.length > 1 ? "s" : ""} available
              </p>
              {teamCount > 0 && (
                <span
                  className="absolute top-0 right-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${color.accent}18`, color: color.accent }}
                >
                  {teamCount} team{teamCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
