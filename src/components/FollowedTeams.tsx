"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { SPORTS } from "@/lib/constants";
import clsx from "clsx";

const SPORT_ICONS: Record<string, string> = {};
for (const s of SPORTS) SPORT_ICONS[s.id] = s.icon;

interface FollowedTeamsProps {
  activeTeamId: string | null;
  onSelectTeam: (id: string) => void;
}

export default function FollowedTeams({ activeTeamId, onSelectTeam }: FollowedTeamsProps) {
  const { preferences, removeTeam } = usePreferencesContext();

  const followedItems = useMemo(() => {
    const items: { id: string; name: string; sport: string; league: string; badge: string }[] = [];
    for (const [sport, teamIds] of Object.entries(preferences.selectedTeams)) {
      for (const id of teamIds) {
        const details = preferences.teamDetails[id];
        if (details) {
          items.push({
            id,
            name: details.name,
            sport,
            league: details.leagueName,
            badge: details.badge,
          });
        }
      }
    }
    return items;
  }, [preferences.selectedTeams, preferences.teamDetails]);

  if (followedItems.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Following</h3>
      <div className="flex flex-wrap gap-2">
        {followedItems.map((item) => {
          const isActive = activeTeamId === item.id;
          return (
            <div
              key={item.id}
              className={clsx(
                "group flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-full text-sm transition-colors cursor-pointer",
                isActive
                  ? "bg-blue-600 text-white border border-blue-600"
                  : "bg-white text-gray-800 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              <button
                onClick={() => onSelectTeam(item.id)}
                className="flex items-center gap-2"
              >
                {item.badge ? (
                  <img src={item.badge} alt="" className="w-4 h-4 rounded-full object-contain" />
                ) : (
                  <span className="text-xs">{SPORT_ICONS[item.sport] || "🏅"}</span>
                )}
                <span className="font-medium">{item.name}</span>
                <span className={clsx("text-xs hidden sm:inline", isActive ? "text-blue-200" : "text-gray-400")}>
                  · {item.league}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTeam(item.id);
                }}
                className={clsx(
                  "ml-0.5 p-0.5 rounded-full transition-colors",
                  isActive
                    ? "text-blue-200 hover:text-white hover:bg-blue-500"
                    : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                )}
                title={`Unfollow ${item.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
