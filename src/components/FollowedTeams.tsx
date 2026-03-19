"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { X, CheckCircle, RotateCcw } from "lucide-react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { SPORTS } from "@/lib/constants";
import clsx from "clsx";

const SPORT_ICONS: Record<string, string> = {};
for (const s of SPORTS) SPORT_ICONS[s.id] = s.icon;

interface FollowedTeamsProps {
  activeTeamId: string | null;
  onSelectTeam: (id: string) => void;
}

interface TeamItem {
  id: string;
  name: string;
  sport: string;
  league: string;
  badge: string;
}

interface UndoEntry {
  item: TeamItem;
  timerId: ReturnType<typeof setTimeout>;
  expiresAt: number;
}

export default function FollowedTeams({ activeTeamId, onSelectTeam }: FollowedTeamsProps) {
  const { preferences, removeTeam } = usePreferencesContext();
  const [confirmItem, setConfirmItem] = useState<TeamItem | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [undoEntries, setUndoEntries] = useState<UndoEntry[]>([]);
  const undoRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const followedItems = useMemo(() => {
    const items: TeamItem[] = [];
    for (const [sport, teamIds] of Object.entries(preferences.selectedTeams)) {
      for (const id of teamIds) {
        const details = preferences.teamDetails[id];
        if (details) {
          items.push({ id, name: details.name, sport, league: details.leagueName, badge: details.badge });
        }
      }
    }
    return items;
  }, [preferences.selectedTeams, preferences.teamDetails]);

  const visibleItems = followedItems.filter((item) => !hiddenIds.has(item.id));

  const handleConfirmRemove = useCallback((item: TeamItem) => {
    setConfirmItem(null);
    // Hide optimistically
    setHiddenIds((prev) => new Set([...prev, item.id]));
    // Start 10s timer
    const expiresAt = Date.now() + 10000;
    const timerId = setTimeout(() => {
      removeTeam(item.id);
      undoRef.current.delete(item.id);
      setUndoEntries((prev) => prev.filter((e) => e.item.id !== item.id));
      setHiddenIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
    }, 10000);
    undoRef.current.set(item.id, timerId);
    setUndoEntries((prev) => [...prev, { item, timerId, expiresAt }]);
  }, [removeTeam]);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap for confirmation dialog
  useEffect(() => {
    if (!confirmItem || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { setConfirmItem(null); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmItem]);

  const handleUndo = useCallback((id: string) => {
    const timerId = undoRef.current.get(id);
    if (timerId) clearTimeout(timerId);
    undoRef.current.delete(id);
    setHiddenIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setUndoEntries((prev) => prev.filter((e) => e.item.id !== id));
  }, []);

  if (visibleItems.length === 0 && undoEntries.length === 0) return null;

  return (
    <>
      {visibleItems.length > 0 && (
        <div className="mb-4 relative">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {visibleItems.map((item) => {
              const isActive = activeTeamId === item.id;
              return (
                <div
                  key={item.id}
                  className={clsx(
                    "group inline-flex items-center gap-2 pl-2.5 py-1.5 rounded-full text-sm transition-colors flex-shrink-0",
                    isActive
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "bg-white text-gray-800 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  )}
                >
                  <button
                    onClick={() => onSelectTeam(item.id)}
                    className="flex items-center gap-2 pr-1"
                    aria-label={`Filter by ${item.name}`}
                    aria-pressed={isActive}
                  >
                    {item.badge ? (
                      <img
                        src={item.badge}
                        alt=""
                        className="w-4 h-4 rounded-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-xs" aria-hidden="true">{SPORT_ICONS[item.sport] || "🏅"}</span>
                    )}
                    <span className="font-medium">{item.name}</span>
                    <span className={clsx("text-xs hidden sm:inline", isActive ? "text-blue-100" : "text-gray-500")}>
                      · {item.league}
                    </span>
                  </button>
                  {/* Remove button — 44px touch target via negative margin trick */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmItem(item); }}
                    className={clsx(
                      "flex items-center justify-center w-7 h-7 rounded-full transition-colors mr-1 -my-1 p-3 -m-1",
                      isActive
                        ? "text-blue-200 hover:text-white hover:bg-blue-500"
                        : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                    )}
                    aria-label={`Remove ${item.name} from followed teams`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
          {/* Scroll fade affordance */}
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" aria-hidden="true" />
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          ref={dialogRef}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setConfirmItem(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900">
                Remove {confirmItem.name}?
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                This will also remove all synced calendar events for this team. You can undo this for 10 seconds after removal.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmItem(null)}
                className="py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors min-h-[44px]"
                autoFocus
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmRemove(confirmItem)}
                className="py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors min-h-[44px]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo toasts */}
      {undoEntries.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4"
          aria-live="polite"
          aria-label="Undo notifications"
        >
          {undoEntries.map(({ item }) => (
            <div
              key={item.id}
              role="status"
              className="flex flex-col bg-gray-900 text-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm flex-1">Removed {item.name}.</span>
                <button
                  onClick={() => handleUndo(item.id)}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors min-h-[44px] px-2"
                  aria-label={`Undo removal of ${item.name}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Undo
                </button>
              </div>
              {/* 10-second countdown progress bar */}
              <div className="h-0.5 bg-gray-700">
                <div
                  className="h-full bg-blue-400 origin-left"
                  style={{ animation: "shrink 10s linear forwards" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
