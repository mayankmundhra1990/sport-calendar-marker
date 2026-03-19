"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Calendar, LogOut, CheckCircle, Menu, X } from "lucide-react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import clsx from "clsx";

export default function Navbar() {
  const { preferences } = usePreferencesContext();
  const { isConnected, disconnect } = useGoogleAuth();
  const pathname = usePathname();
  const totalTeams = Object.values(preferences.selectedTeams).flat().length;
  const [showGoogleMenu, setShowGoogleMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const googleMenuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (googleMenuRef.current && !googleMenuRef.current.contains(e.target as Node)) {
        setShowGoogleMenu(false);
      }
    }
    if (showGoogleMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGoogleMenu]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") { setMobileOpen(false); return; }
        if (e.key !== "Tab" || !drawerRef.current) return;
        const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        )).filter((el) => !el.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKey);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <>
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />
            Sport Calendar
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/"
              className={clsx(
                "text-sm font-medium transition-colors",
                pathname === "/" || pathname.startsWith("/browse")
                  ? "text-gray-900 underline underline-offset-4 decoration-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
              aria-current={pathname === "/" || pathname.startsWith("/browse") ? "page" : undefined}
            >
              Browse
            </Link>
            <Link
              href="/dashboard"
              className={clsx(
                "text-sm px-4 py-2 rounded-lg transition-colors",
                pathname === "/dashboard"
                  ? "bg-blue-700 text-white ring-2 ring-blue-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
              aria-current={pathname === "/dashboard" ? "page" : undefined}
            >
              Dashboard{totalTeams > 0 && ` (${totalTeams})`}
            </Link>

            {isConnected ? (
              <div className="relative" ref={googleMenuRef}>
                <button
                  onClick={() => setShowGoogleMenu(!showGoogleMenu)}
                  aria-label="Google Calendar connected — click to manage"
                  aria-expanded={showGoogleMenu}
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                {showGoogleMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                      Google Calendar connected
                    </div>
                    <button
                      onClick={() => { setConfirmDisconnect(true); setShowGoogleMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Disconnect Google
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/api/calendar/google/auth"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Connect Google
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {confirmDisconnect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disconnect-dialog-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") { setConfirmDisconnect(false); return; }
            if (e.key !== "Tab") return;
            const focusable = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])'));
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
              e.preventDefault();
              (e.shiftKey ? last : first).focus();
            }
          }}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setConfirmDisconnect(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 id="disconnect-dialog-title" className="text-base font-semibold text-gray-900 mb-2">Disconnect Google Calendar?</h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Synced events will remain in your calendar, but new matches won&apos;t be added automatically. You can reconnect at any time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDisconnect(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                autoFocus
              >
                Cancel
              </button>
              <button
                onClick={() => { disconnect(); setConfirmDisconnect(false); }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col" ref={drawerRef}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                Sport Calendar
              </span>
              <button
                ref={closeButtonRef}
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {isConnected && (
              <div className="px-4 py-2.5 bg-green-50 border-b border-green-100 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Google Calendar connected
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-2">
              <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Browse</p>
              {[
                { href: "/browse/football",   label: "⚽ Football" },
                { href: "/browse/basketball", label: "🏀 Basketball" },
                { href: "/browse/cricket",    label: "🏏 Cricket" },
                { href: "/browse/tennis",     label: "🎾 Tennis" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-3 text-sm transition-colors",
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50 font-medium border-l-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center px-4 py-3 text-sm font-medium transition-colors",
                    pathname === "/dashboard"
                      ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                  aria-current={pathname === "/dashboard" ? "page" : undefined}
                >
                  Dashboard
                  {totalTeams > 0 && (
                    <span className="ml-auto text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
                      {totalTeams}
                    </span>
                  )}
                </Link>
              </div>

              <div className="border-t border-gray-100 mt-2 pt-2">
                {isConnected ? (
                  <button
                    onClick={() => { setConfirmDisconnect(true); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Disconnect Google Calendar
                  </button>
                ) : (
                  <Link
                    href="/api/calendar/google/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Connect Google Calendar
                  </Link>
                )}
              </div>
            </nav>

            <div className="px-4 py-3 border-t border-gray-100">
              <Link
                href="/privacy"
                onClick={() => setMobileOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
