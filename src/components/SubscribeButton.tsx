"use client";

import { useState } from "react";
import { usePreferencesContext } from "@/context/PreferencesContext";
import { LinkIcon, Check, Copy } from "lucide-react";

export default function SubscribeButton() {
  const { preferences } = usePreferencesContext();
  const [copied, setCopied] = useState(false);

  const allTeamIds = Object.values(preferences.selectedTeams).flat();
  if (allTeamIds.length === 0) return null;

  const handleCopy = () => {
    const url = `${window.location.origin}/api/subscribe?teams=${allTeamIds.join(",")}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
      title="Copy calendar subscription URL for Google/Apple Calendar"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <LinkIcon className="w-4 h-4" />
          Subscribe URL
        </>
      )}
    </button>
  );
}
