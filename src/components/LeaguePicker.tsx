"use client";

import { useState } from "react";
import type { LeagueConfig } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FOOTBALL_REGIONS } from "@/lib/constants";
import { usePreferencesContext } from "@/context/PreferencesContext";
import clsx from "clsx";

interface LeaguePickerProps {
  leagues: LeagueConfig[];
  selected: string;
  onSelect: (leagueId: string) => void;
}

function groupLeagues(leagues: LeagueConfig[]): Record<string, LeagueConfig[]> {
  const groups: Record<string, LeagueConfig[]> = {};
  for (const league of leagues) {
    const region = FOOTBALL_REGIONS[league.id] ?? league.country ?? "Other";
    if (!groups[region]) groups[region] = [];
    groups[region].push(league);
  }
  return groups;
}

export default function LeaguePicker({ leagues, selected, onSelect }: LeaguePickerProps) {
  const { preferences } = usePreferencesContext();
  const hasRegions = leagues.some((l) => FOOTBALL_REGIONS[l.id]);

  // Count followed teams per league
  const teamsByLeague = Object.values(preferences.teamDetails).reduce<Record<string, number>>(
    (acc, t) => { acc[t.leagueId] = (acc[t.leagueId] ?? 0) + 1; return acc; },
    {}
  );

  if (!hasRegions) {
    // Simple flat layout for sports with few leagues (basketball, cricket)
    return (
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select league">
        {leagues.map((league) => {
          const count = teamsByLeague[league.id] ?? 0;
          return (
            <button
              key={league.id}
              role="radio"
              aria-checked={selected === league.id}
              onClick={() => onSelect(league.id)}
              className={clsx(
                "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px]",
                selected === league.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {league.name}
              {count > 0 && (
                <span className={clsx("ml-1.5 text-xs font-semibold", selected === league.id ? "text-blue-200" : "text-blue-600")}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Grouped layout for football
  const groups = groupLeagues(leagues);
  const regionOrder = ["Europe", "European Competitions", "Americas", "Middle East", "Asia", "Other"];
  const orderedGroups = regionOrder
    .filter((r) => groups[r])
    .map((r) => ({ region: r, items: groups[r] }));
  // Append any regions not in the order
  Object.keys(groups)
    .filter((r) => !regionOrder.includes(r))
    .forEach((r) => orderedGroups.push({ region: r, items: groups[r] }));

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Select league by region">
      {orderedGroups.map(({ region, items }, idx) => (
        <RegionGroup
          key={region}
          region={region}
          leagues={items}
          selected={selected}
          onSelect={onSelect}
          defaultOpen={idx === 0}
          teamsByLeague={teamsByLeague}
        />
      ))}
    </div>
  );
}

function RegionGroup({
  region,
  leagues,
  selected,
  onSelect,
  defaultOpen,
  teamsByLeague,
}: {
  region: string;
  leagues: LeagueConfig[];
  selected: string;
  onSelect: (id: string) => void;
  defaultOpen: boolean;
  teamsByLeague: Record<string, number>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasSelected = leagues.some((l) => l.id === selected);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-600 transition-colors"
        aria-expanded={open}
        aria-label={`${region} leagues — ${open ? "collapse" : "expand"}`}
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {region}
        {hasSelected && !open && (
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" aria-label="has selected league" />
        )}
      </button>
      {open && (
        <div className="flex flex-wrap gap-2 pl-5">
          {leagues.map((league) => {
            const count = teamsByLeague[league.id] ?? 0;
            return (
              <button
                key={league.id}
                role="radio"
                aria-checked={selected === league.id}
                onClick={() => onSelect(league.id)}
                className={clsx(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px]",
                  selected === league.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {league.name}
                {count > 0 && (
                  <span className={clsx("ml-1.5 text-xs font-semibold", selected === league.id ? "text-blue-200" : "text-blue-600")}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
