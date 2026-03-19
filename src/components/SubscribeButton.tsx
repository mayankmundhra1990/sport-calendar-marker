"use client";

import { useState, useRef, useEffect } from "react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { Check, Copy, X, ExternalLink } from "lucide-react";

export default function SubscribeButton() {
  const { preferences } = usePreferencesContext();
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const allTeamIds = Object.values(preferences.selectedTeams).flat();
  if (allTeamIds.length === 0) return null;

  const getUrl = () => `${window.location.origin}/api/subscribe?teams=${allTeamIds.join(",")}`;

  const handleCopy = () => {
    const url = getUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Move focus into popover when it opens
  useEffect(() => {
    if (showInfo) {
      closeButtonRef.current?.focus();
    }
  }, [showInfo]);

  // Close popover on outside click or Escape
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowInfo(false);
    }
    if (showInfo) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showInfo]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="Subscribe via URL for Apple Calendar or Outlook — get automatic match schedule updates"
        aria-expanded={showInfo}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Subscribe (Apple / Outlook)
      </button>

      {showInfo && (
        <div
          className="absolute right-0 top-full mt-2 w-screen max-w-[320px] sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
          style={{ left: "auto", maxWidth: "calc(100vw - 2rem)" }}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const focusable = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
              'button, input, a, [tabindex]:not([tabindex="-1"])'
            ));
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
              e.preventDefault();
              (e.shiftKey ? last : first).focus();
            }
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Subscribe to Calendar Feed</p>
            <button
              ref={closeButtonRef}
              onClick={() => setShowInfo(false)}
              className="flex items-center justify-center w-11 h-11 -mt-2 -mr-1 ml-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Close subscribe popover"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            For <strong>Apple Calendar</strong>, <strong>Outlook</strong>, or any app that supports iCal — paste this URL to get automatic match updates. <span className="text-gray-400">(Google Calendar users are synced automatically.)</span>
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              readOnly
              value={mounted ? getUrl() : ""}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 min-w-0"
              onClick={(e) => (e.target as HTMLInputElement).select()}
              aria-label="Calendar subscription URL"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
              aria-label="Copy subscription URL"
            >
              {copied ? <><Check className="w-3.5 h-3.5" aria-hidden="true" /> Copied!</> : <><Copy className="w-3.5 h-3.5" aria-hidden="true" /> Copy</>}
            </button>
          </div>
          <a
            href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(mounted ? `webcal://${window.location.host}/api/subscribe?teams=${allTeamIds.join(",")}` : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Open directly in Google Calendar
          </a>
        </div>
      )}
    </div>
  );
}
