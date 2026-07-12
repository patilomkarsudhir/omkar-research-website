"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CloudSun, Palette, Sparkles } from "lucide-react";
import {
  DEFAULT_THEME,
  isThemeId,
  resolveAutoTheme,
  resolveWeatherTheme,
  THEMES,
  timeBucket,
  timeBucketLabel,
  weatherLabel,
  type ThemeId,
  type ThemeMode,
} from "../lib/themes";

const MODE_KEY = "themeMode";
const LEGACY_KEY = "theme";
const WEATHER_KEY = "themeWeather";

// How often auto mode re-evaluates the time band (and refreshes weather).
const REEVAL_MS = 15 * 60 * 1000;
const WEATHER_TTL_MS = 60 * 60 * 1000;

type WeatherStatus = "idle" | "locating" | "ready" | "error";
type WeatherSample = { code: number; isDay: boolean };

export default function ThemeSwitcher({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [resolved, setResolved] = useState<ThemeId>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const [weatherOn, setWeatherOn] = useState(false);
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>("idle");
  const [weatherName, setWeatherName] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef<ThemeMode>(mode);
  const weatherOnRef = useRef(weatherOn);
  const lastWeatherRef = useRef<WeatherSample | null>(null);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    weatherOnRef.current = weatherOn;
  }, [weatherOn]);

  const applyTheme = useCallback((next: ThemeId) => {
    setResolved(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const applyAuto = useCallback(() => {
    if (weatherOnRef.current && lastWeatherRef.current) {
      const { code, isDay } = lastWeatherRef.current;
      applyTheme(resolveWeatherTheme(code, isDay));
    } else {
      applyTheme(resolveAutoTheme());
    }
  }, [applyTheme]);

  const refreshWeather = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setWeatherStatus("error");
      return;
    }
    setWeatherStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Round to ~1 decimal (~11 km) so we never send precise coordinates.
          const lat = Math.round(pos.coords.latitude * 10) / 10;
          const lon = Math.round(pos.coords.longitude * 10) / 10;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,is_day`,
            { signal: controller.signal }
          );
          clearTimeout(timer);
          const data = await res.json();
          const code = Number(data?.current?.weather_code);
          const isDay = data?.current?.is_day === 1;
          if (!Number.isFinite(code)) throw new Error("bad weather payload");
          lastWeatherRef.current = { code, isDay };
          lastFetchRef.current = Date.now();
          setWeatherName(weatherLabel(code));
          setWeatherStatus("ready");
          if (modeRef.current === "auto") applyTheme(resolveWeatherTheme(code, isDay));
        } catch {
          setWeatherStatus("error");
        }
      },
      () => setWeatherStatus("error"),
      { timeout: 8000, maximumAge: WEATHER_TTL_MS, enableHighAccuracy: false }
    );
  }, [applyTheme]);

  // Initialize from storage / the pre-hydration attribute.
  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute("data-theme");
    if (isThemeId(current)) setResolved(current);

    const storedMode = localStorage.getItem(MODE_KEY);
    const legacy = localStorage.getItem(LEGACY_KEY);
    let initialMode: ThemeMode;
    if (storedMode === "auto") initialMode = "auto";
    else if (isThemeId(storedMode)) initialMode = storedMode;
    else if (isThemeId(legacy)) initialMode = legacy;
    else initialMode = "auto";
    setMode(initialMode);

    const weatherPref = localStorage.getItem(WEATHER_KEY) === "1";
    setWeatherOn(weatherPref);
    weatherOnRef.current = weatherPref;
    modeRef.current = initialMode;

    if (initialMode === "auto") {
      if (weatherPref) refreshWeather();
      else applyTheme(resolveAutoTheme());
    }
  }, [applyTheme, refreshWeather]);

  // Re-evaluate periodically and when the tab regains focus (auto mode only).
  useEffect(() => {
    const tick = () => {
      if (modeRef.current !== "auto") return;
      if (weatherOnRef.current && Date.now() - lastFetchRef.current > WEATHER_TTL_MS) {
        refreshWeather();
      } else {
        applyAuto();
      }
    };
    const interval = window.setInterval(tick, REEVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [applyAuto, refreshWeather]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectAuto = () => {
    setMode("auto");
    modeRef.current = "auto";
    try {
      localStorage.setItem(MODE_KEY, "auto");
    } catch {
      /* ignore */
    }
    if (weatherOnRef.current) refreshWeather();
    else applyTheme(resolveAutoTheme());
    setOpen(false);
  };

  const selectTheme = (id: ThemeId) => {
    setMode(id);
    modeRef.current = id;
    try {
      localStorage.setItem(MODE_KEY, id);
      localStorage.setItem(LEGACY_KEY, id);
    } catch {
      /* ignore */
    }
    applyTheme(id);
    setOpen(false);
  };

  const toggleWeather = () => {
    if (!weatherOn) {
      setWeatherOn(true);
      weatherOnRef.current = true;
      setMode("auto");
      modeRef.current = "auto";
      try {
        localStorage.setItem(WEATHER_KEY, "1");
        localStorage.setItem(MODE_KEY, "auto");
      } catch {
        /* ignore */
      }
      refreshWeather();
    } else {
      setWeatherOn(false);
      weatherOnRef.current = false;
      lastWeatherRef.current = null;
      setWeatherStatus("idle");
      setWeatherName("");
      try {
        localStorage.removeItem(WEATHER_KEY);
      } catch {
        /* ignore */
      }
      if (modeRef.current === "auto") applyTheme(resolveAutoTheme());
    }
  };

  const activeTheme = THEMES.find((t) => t.id === resolved) ?? THEMES[0];
  const isAuto = mode === "auto";
  const TriggerIcon = !mounted ? Palette : isAuto ? Sparkles : activeTheme.icon;

  const bucketText = mounted ? timeBucketLabel(timeBucket(new Date().getHours())) : "";
  const autoSubtitle = !mounted
    ? "Adapts to your day"
    : weatherOn && weatherStatus === "ready"
    ? `Weather · ${weatherName} · ${activeTheme.label}`
    : `${bucketText} · ${activeTheme.label}`;

  const weatherText =
    weatherStatus === "locating"
      ? "Locating…"
      : weatherStatus === "error"
      ? "Location unavailable"
      : weatherOn && weatherStatus === "ready"
      ? `On · ${weatherName}`
      : "Match local weather";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--border-soft)] px-2.5 py-1.5 text-[var(--text)] hover:bg-[var(--surface-weak)] hover:text-[var(--accent)] transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isAuto ? "Theme: Auto. Change theme" : `Theme: ${activeTheme.label}. Change theme`}
        title="Change theme"
      >
        <TriggerIcon className="h-[18px] w-[18px]" aria-hidden="true" />
        <Palette className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Select a theme"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--panel)] p-1.5 shadow-xl"
        >
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Automatic
          </p>

          <button
            type="button"
            role="menuitemradio"
            aria-checked={isAuto}
            onClick={selectAuto}
            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-weak)] ${
              isAuto ? "text-[var(--accent)]" : "text-[var(--text)]"
            }`}
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--surface-weak)]">
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-medium leading-tight">Auto</span>
              <span className="truncate text-xs text-[var(--muted)]">{autoSubtitle}</span>
            </span>
            {isAuto && <Check className="ml-auto h-4 w-4 flex-none" aria-hidden="true" />}
          </button>

          <button
            type="button"
            aria-pressed={weatherOn}
            onClick={toggleWeather}
            className={`mt-0.5 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-weak)] ${
              weatherOn ? "text-[var(--accent)]" : "text-[var(--text)]"
            }`}
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--surface-weak)]">
              <CloudSun className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-medium leading-tight">{weatherText}</span>
              <span className="truncate text-xs text-[var(--muted)]">
                Optional · approximate location only
              </span>
            </span>
            <span
              className={`ml-auto flex h-5 w-9 flex-none items-center rounded-full border border-[var(--border-soft)] px-0.5 transition-colors ${
                weatherOn ? "justify-end bg-[var(--accent)]/30" : "justify-start"
              }`}
              aria-hidden="true"
            >
              <span className="h-3.5 w-3.5 rounded-full bg-[var(--text)]/70" />
            </span>
          </button>

          <div className="my-1.5 h-px bg-[var(--border-soft)]" />

          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Themes
          </p>
          {THEMES.map((option) => {
            const Icon = option.icon;
            const isActive = !isAuto && option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => selectTheme(option.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-weak)] ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--text)]"
                }`}
              >
                <span
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-[var(--border-soft)]"
                  style={{ backgroundColor: option.swatch }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium leading-tight">{option.label}</span>
                  <span className="truncate text-xs text-[var(--muted)]">{option.description}</span>
                </span>
                {isActive && <Check className="ml-auto h-4 w-4 flex-none" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
