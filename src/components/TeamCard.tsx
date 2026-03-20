"use client";

import type { Team } from "@/lib/types";
import type { SyncStatus } from "@/hooks/useCalendarSync";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { useState } from "react";
import { Check, Plus, Loader2 } from "lucide-react";
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
        "flex flex-col items-center gap-1 p-2 pt-2.5 rounded-lg border text-center transition-all w-full overflow-hidden relative",
        selected
          ? "border-gray-200 bg-white shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        syncing && "cursor-wait"
      )}
      style={selected ? { borderBottomWidth: 3, borderBottomColor: sportColor.accent } : {}}
    >
      {/* Badge */}
      <div className="relative w-8 h-8 flex-shrink-0" aria-hidden="true">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold absolute inset-0"
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
            className="w-8 h-8 object-contain absolute inset-0"
            onError={() => setBadgeError(true)}
          />
        )}
      </div>

      {/* Name */}
      <p className="text-[11px] font-medium text-gray-900 leading-tight line-clamp-2 w-full px-0.5">
        {team.name}
      </p>

      {/* Action icon */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
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
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : selected ? (
          <Check className="w-3 h-3" />
        ) : (
          <Plus className="w-3 h-3" />
        )}
      </div>
    </button>
  );
}
