"use client";

import type { Team } from "@/lib/types";
import type { SyncStatus } from "@/hooks/useCalendarSync";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { Check, Plus, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface TeamCardProps {
  team: Team;
  syncStatus?: SyncStatus;
  onAdd: (team: Team) => void;
  onRemove: (teamId: string) => void;
}

export default function TeamCard({ team, syncStatus, onAdd, onRemove }: TeamCardProps) {
  const { isTeamSelected } = usePreferencesContext();
  const selected = isTeamSelected(team.id);
  const syncing = syncStatus?.status === "syncing";

  const handleClick = () => {
    if (syncing) return;
    if (selected) {
      onRemove(team.id);
    } else {
      onAdd(team);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={syncing}
      className={clsx(
        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all w-full",
        selected
          ? "border-blue-300 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        syncing && "cursor-wait"
      )}
    >
      {team.badge ? (
        <img
          src={team.badge}
          alt={team.name}
          className="w-10 h-10 object-contain flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{team.name}</p>
        {syncStatus?.status === "success" && syncStatus.matchCount ? (
          <p className="text-xs text-green-600 truncate">
            {syncStatus.matchCount} match{syncStatus.matchCount > 1 ? "es" : ""} synced
          </p>
        ) : syncStatus?.status === "error" ? (
          <p className="text-xs text-red-500 truncate flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Sync failed
          </p>
        ) : syncStatus?.status === "no_matches" ? (
          <p className="text-xs text-amber-600 truncate">No matches found</p>
        ) : (
          <p className="text-xs text-gray-500 truncate">{team.country}</p>
        )}
      </div>
      <div
        className={clsx(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
          syncing
            ? "bg-blue-100 text-blue-500"
            : selected
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-400"
        )}
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
