import Link from "next/link";
import { CalendarPlus } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <CalendarPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No teams selected</h3>
      <p className="text-gray-500 mb-6">
        Pick your favorite teams to see their upcoming matches here.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Browse Sports
      </Link>
    </div>
  );
}
