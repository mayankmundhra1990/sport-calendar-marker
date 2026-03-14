import type { Match, AllSportsAPIFixture } from "./types";
import { normalizeAllSportsFixture } from "./normalize";

const ALLSPORTS_BASE_URL = "https://apiv2.allsportsapi.com/tennis";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Fetch upcoming tennis fixtures from AllSportsAPI.
 * Returns all ATP + WTA matches in the given date range, normalized to Match[].
 * Default: today → today + 60 days.
 */
export async function getTennisFixtures(
  fromDate?: Date,
  toDate?: Date
): Promise<Match[]> {
  const apiKey = process.env.ALLSPORTS_API_KEY;
  if (!apiKey) {
    console.error("ALLSPORTS_API_KEY environment variable is not set");
    return [];
  }

  const from = formatDate(fromDate || new Date());
  const to = formatDate(
    toDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  );

  const url = `${ALLSPORTS_BASE_URL}/?met=Fixtures&APIkey=${apiKey}&from=${from}&to=${to}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    // AllSportsAPI error format: { error: "1", result: [{ msg: "...", cod: "..." }] }
    if (data.error) {
      const msg = data.result?.[0]?.msg || "AllSportsAPI error";
      console.error("AllSportsAPI error:", msg);
      return [];
    }

    if (data.success !== 1 || !Array.isArray(data.result)) {
      return [];
    }

    return (data.result as AllSportsAPIFixture[]).map(normalizeAllSportsFixture);
  } catch (err) {
    console.error("AllSportsAPI fetch failed:", err);
    return [];
  }
}
