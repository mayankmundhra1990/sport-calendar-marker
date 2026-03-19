import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { SPORTS, SPORT_COLORS } from "@/lib/constants";

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <CalendarPlus className="w-8 h-8 text-gray-300" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams followed yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
        Pick your favourite teams to see their upcoming matches and sync to your calendar.
      </p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Browse a sport to get started</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SPORTS.map((sport) => {
          const color = SPORT_COLORS[sport.id];
          return (
            <Link
              key={sport.id}
              href={`/browse/${sport.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors hover:opacity-90"
              style={{
                background: color.lightHex,
                color: color.accent,
                borderColor: `${color.accent}40`,
              }}
            >
              {sport.icon} {sport.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
