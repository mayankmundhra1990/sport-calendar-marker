"use client";

import Link from "next/link";
import { SPORTS, SPORT_COLORS } from "@/lib/constants";
import { usePreferencesContext } from "@/context/PreferencesContext";

export default function SportSelector() {
  const { preferences } = usePreferencesContext();

  return (
    <div className="grid grid-cols-4 gap-2">
      {SPORTS.map((sport) => {
        const teamCount = (preferences.selectedTeams[sport.id] || []).length;
        const color = SPORT_COLORS[sport.id];
        return (
          <Link
            key={sport.id}
            href={`/browse/${sport.id}`}
            className="group relative block rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-all overflow-hidden text-center"
            style={{ borderBottomWidth: 3, borderBottomColor: color.accent }}
          >
            {/* Hover gradient */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${color.lightHex} 0%, transparent 60%)` }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="text-2xl mb-1" aria-hidden="true">{sport.icon}</div>
              <h3
                className="text-xs font-semibold text-gray-900"
                style={{ color: teamCount > 0 ? color.accent : undefined }}
              >
                {sport.name}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                {sport.leagues.length} league{sport.leagues.length > 1 ? "s" : ""}
              </p>
              {teamCount > 0 && (
                <span
                  className="mt-1 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${color.accent}18`, color: color.accent }}
                >
                  {teamCount}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
