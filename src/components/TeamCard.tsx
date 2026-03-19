"use client";

import type { Team } from "@/lib/types";
import type { SyncStatus } from "@/hooks/useCalendarSync";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { useState } from "react";
import { Check, Plus, Loader2, AlertCircle } from "lucide-react";
import { SPORT_COLORS } from "@/lib/constants";
import clsx from "clsx";

interface TeamCardProps {
  team: Team;
  syncStatus?: SyncStatus;
  onAdd: (team: Team) => void;
  onRemove: (teamId: string) => void;
}

export default function TeamCard({ team, syncStatus, onAdd, onRemove }: TeamCardProps) {
  const { isTeamSelected } = usePreferencesContext();
  const [badgeError, setBadgeError] = useState(false);
  const selected = isTeamSelected(team.id);
  const syncing = syncStatus?.status === "syncing";
  const sportColor = SPORT_COLORS[team.sport] ?? SPORT_COLORS["football"];

  const handleClick = () => {
    if (syncing) return;
    if (selected) onRemove(team.id);
    else onAdd(team);
  };

  return (
    <button
      onClick={handleClick}
      disabled={syncing}
      aria-label={selected ? `Unfollow ${team.name}` : `Follow ${team.name}`}
      aria-pressed={selected}
      className={clsx(
        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full overflow-hidden relative",
        selected
          ? "border-gray-200 bg-white shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        syncing && "cursor-wait"
      )}
      style={selected ? { borderLeftWidth: 3, borderLeftColor: sportColor.accent } : {}}
    >
      {/* Badge with fallback */}
      <div className="relative w-10 h-10 flex-shrink-0" aria-hidden="true">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold absolute inset-0"
          style={{
            background: `${sportColor.accent}18`,
            color: sportColor.accent,
            border: `2px solid ${sportColor.accent}40`,
          }}
        >
          {team.name[0]}
        </div>
        {team.badge && !badgeError && (
          <img
            src={team.badge}
            alt=""
            className="w-10 h-10 object-contain absolute inset-0"
            onError={() => setBadgeError(true)}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{team.name}</p>
        {syncStatus?.status === "success" && syncStatus.matchCount ? (
          <p className="text-xs text-green-600 truncate">
            {syncStatus.matchCount} match{syncStatus.matchCount > 1 ? "es" : ""} synced
          </p>
        ) : syncStatus?.status === "error" ? (
          <p className="text-xs text-red-500 truncate flex items-center gap-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            Sync failed
          </p>
        ) : syncStatus?.status === "no_matches" ? (
          <p className="text-xs text-amber-600 truncate">No matches found</p>
        ) : (
          <p className="text-xs text-gray-500 truncate">{team.country}</p>
        )}
      </div>

      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={
          syncing
            ? { background: `${sportColor.accent}20`, color: sportColor.accent }
            : selected
              ? { background: sportColor.accent, color: "white" }
              : { background: "#f3f4f6", color: "#9ca3af" }
        }
        aria-hidden="true"
      >
        {syncing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : selected ? (
          <Check className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </div>
    </button>
  );
}
