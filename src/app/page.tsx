"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SportSelector from "@/components/SportSelector";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { CheckCircle, AlertCircle, Users, CalendarCheck, Zap } from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: "Find your favourite teams",
    desc: "Search clubs &amp; players across football, basketball, cricket &amp; tennis",
  },
  {
    icon: CalendarCheck,
    title: "Connect your Google account",
    desc: "One-tap sign-in to link your Google Calendar",
  },
  {
    icon: Zap,
    title: "Matches sync automatically",
    desc: "Every fixture lands in your calendar the moment it's scheduled",
  },
];

function HomeContent() {
  const { isConnected } = useGoogleAuth();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  return (
    <div>
      {/* Hero */}
      <div className="relative -mx-4 sm:-mx-6 mb-6 overflow-hidden rounded-b-2xl sm:rounded-2xl" style={{ minHeight: 220 }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" aria-hidden="true" />
        {/* Text */}
        <div className="relative flex flex-col items-center justify-end h-full px-6 pb-8 pt-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Never Miss a Match
          </h1>
          <p className="text-white/80 text-sm mt-2 max-w-xs">
            Follow your teams. Every fixture, auto-synced to your calendar.
          </p>
        </div>
      </div>

      {authError && (
        <div
          className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {authError === "auth_failed"
            ? "Google Calendar connection failed. Please try again."
            : "Could not connect to Google Calendar. Please try again."}
        </div>
      )}

      {/* How it works */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How it works</p>
        <ol className="grid grid-cols-3 gap-2 list-none">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
            <li
              key={i}
              className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 flex-shrink-0" aria-hidden="true">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-gray-800 leading-snug">{title}</p>
              <p
                className="text-[11px] text-gray-500 mt-0.5 leading-snug hidden sm:block"
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </li>
          ))}
        </ol>
      </div>

      {/* Google Calendar CTA */}
      {!isConnected ? (
        <div className="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Connect Google Calendar for automatic sync</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Optional — or download .ics files / subscribe via URL for Apple Calendar &amp; Outlook.
            </p>
          </div>
          <GoogleAuthButton />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
          <CheckCircle className="w-4 h-4" aria-hidden="true" />
          Google Calendar connected — select teams below to auto-sync their matches.
        </div>
      )}

      <SportSelector />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
