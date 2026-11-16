import type { FlareClass, SpaceWeatherEvent } from '../engine/types';

/** Subset of the DONKI FLR (solar flare) response we rely on. */
export interface DonkiFlare {
  flrID: string;
  peakTime: string | null;
  beginTime: string;
  classType: string | null;
}

export const DONKI_ENDPOINTS = {
  /** api.nasa.gov proxy - needs an API key (DEMO_KEY works, heavily rate-limited). Sends CORS headers. */
  nasaApi: (start: string, end: string, apiKey: string) =>
    `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${encodeURIComponent(apiKey)}`,
  /** CCMC direct endpoint - no key needed. */
  ccmc: (start: string, end: string) =>
    `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=${start}&endDate=${end}`,
} as const;

export function parseDonkiFlares(raw: unknown): SpaceWeatherEvent[] {
  if (!Array.isArray(raw)) throw new Error('DONKI FLR response is not an array');
  const events: SpaceWeatherEvent[] = [];
  for (const item of raw as DonkiFlare[]) {
    const classType = item.classType?.trim();
    const flareClass = classType?.charAt(0).toUpperCase();
    if (!classType || (flareClass !== 'C' && flareClass !== 'M' && flareClass !== 'X')) continue;
    const time = item.peakTime ?? item.beginTime;
    events.push({
      date: time.slice(0, 10),
      classType,
      flareClass: flareClass as FlareClass,
      sourceId: item.flrID,
    });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchDonkiFlares(
  start: string,
  end: string,
  apiKey: string,
  { timeoutMs = 15000 }: { timeoutMs?: number } = {},
): Promise<SpaceWeatherEvent[]> {
  const urls = [DONKI_ENDPOINTS.ccmc(start, end), DONKI_ENDPOINTS.nasaApi(start, end, apiKey)];
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return parseDonkiFlares(await response.json());
    } catch (error) {
      errors.push(`${new URL(url).host}: ${(error as Error).message}`);
    }
  }
  throw new Error(`All DONKI endpoints failed (${errors.join('; ')})`);
}
