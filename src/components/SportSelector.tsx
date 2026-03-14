"use client";

import Link from "next/link";
import { SPORTS } from "@/lib/constants";
import { usePreferencesContext } from "@/context/PreferencesContext";

export default function SportSelector() {
  const { preferences } = usePreferencesContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SPORTS.map((sport) => {
        const teamCount = (preferences.selectedTeams[sport.id] || []).length;
        return (
          <Link
            key={sport.id}
            href={`/browse/${sport.id}`}
            className="group relative block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="text-4xl mb-3">{sport.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {sport.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {sport.leagues.length} league{sport.leagues.length > 1 ? "s" : ""} available
            </p>
            {teamCount > 0 && (
              <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                {teamCount} team{teamCount > 1 ? "s" : ""}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
