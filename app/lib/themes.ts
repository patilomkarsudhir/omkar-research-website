import { Sun, Moon, MoonStar, Coffee, Cloudy, Waves, type LucideIcon } from "lucide-react";

export type ThemeId = "light" | "dark" | "midnight" | "sepia" | "slate" | "ocean";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Swatch color shown in the picker (matches the theme background). */
  swatch: string;
}

export const THEMES: ThemeOption[] = [
  { id: "light", label: "Light", description: "Clean daylight", icon: Sun, swatch: "#f4f7fb" },
  { id: "dark", label: "Dark", description: "Deep neutral dark", icon: Moon, swatch: "#0a0c12" },
  { id: "midnight", label: "Midnight", description: "Indigo night", icon: MoonStar, swatch: "#0b0a1c" },
  { id: "sepia", label: "Sepia", description: "Warm paper", icon: Coffee, swatch: "#f1e7d6" },
  { id: "slate", label: "Slate", description: "Cool gray", icon: Cloudy, swatch: "#e6eaf0" },
  { id: "ocean", label: "Ocean", description: "Teal depths", icon: Waves, swatch: "#061a1e" },
];

export const THEME_IDS: ThemeId[] = THEMES.map((t) => t.id);

export const DEFAULT_THEME: ThemeId = "light";

/** The value stored for the theme preference: an explicit theme or "auto". */
export type ThemeMode = ThemeId | "auto";

export function isThemeId(value: string | null): value is ThemeId {
  return value !== null && (THEME_IDS as string[]).includes(value);
}

/* ------------------------------------------------------------------ */
/* Automatic selection                                                 */
/*                                                                     */
/* The "auto" mode picks a theme from the visitor's local time of day  */
/* (their device timezone, no permission needed). A deterministic      */
/* per-day hash chooses among the pool for that time band, so the look */
/* is stable within a day but rotates day to day for a bit of life.    */
/* ------------------------------------------------------------------ */

export type TimeBucket = "dawn" | "day" | "dusk" | "night";

export const AUTO_POOLS: Record<TimeBucket, ThemeId[]> = {
  dawn: ["sepia", "light", "slate"],
  day: ["light", "slate", "sepia"],
  dusk: ["ocean", "slate", "midnight"],
  night: ["dark", "midnight", "ocean"],
};

export function timeBucket(hour: number): TimeBucket {
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

export function timeBucketLabel(bucket: TimeBucket): string {
  const labels: Record<TimeBucket, string> = {
    dawn: "Dawn",
    day: "Daytime",
    dusk: "Dusk",
    night: "Night",
  };
  return labels[bucket];
}

/** Stable 32-bit hash of the calendar day (local), for daily variety. */
export function dailyHash(d: Date = new Date()): number {
  const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  let x = key ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 15), 0x85ebca6b);
  x ^= x >>> 13;
  return x >>> 0;
}

export function resolveAutoTheme(d: Date = new Date()): ThemeId {
  const pool = AUTO_POOLS[timeBucket(d.getHours())];
  return pool[dailyHash(d) % pool.length];
}

/* ------------------------------------------------------------------ */
/* Optional weather refinement (opt-in)                                */
/*                                                                     */
/* Maps WMO weather codes (from the keyless Open-Meteo API) to a pool  */
/* of fitting themes. Only used when the visitor explicitly enables it.*/
/* ------------------------------------------------------------------ */

export function weatherThemePool(code: number, isDay: boolean): ThemeId[] {
  if (code >= 95) return ["midnight", "dark"]; // thunderstorm
  if (code >= 85) return ["slate", "light"]; // snow showers
  if (code >= 80) return ["ocean", "midnight"]; // rain showers
  if (code >= 71) return isDay ? ["light", "slate"] : ["midnight", "dark"]; // snow
  if (code >= 51) return ["ocean", "midnight"]; // drizzle / rain
  if (code >= 45) return ["slate", "midnight"]; // fog
  if (code === 3) return ["slate", "midnight"]; // overcast
  if (code === 1 || code === 2) return isDay ? ["light", "slate"] : ["midnight", "dark"]; // partly cloudy
  return isDay ? ["light", "sepia"] : ["midnight", "dark"]; // clear (0)
}

export function resolveWeatherTheme(code: number, isDay: boolean, d: Date = new Date()): ThemeId {
  const pool = weatherThemePool(code, isDay);
  return pool[dailyHash(d) % pool.length];
}

export function weatherLabel(code: number): string {
  if (code >= 95) return "Thunderstorm";
  if (code >= 80) return "Showers";
  if (code >= 71) return "Snow";
  if (code >= 51) return "Rain";
  if (code >= 45) return "Fog";
  if (code === 3) return "Overcast";
  if (code === 1 || code === 2) return "Partly cloudy";
  return "Clear";
}
