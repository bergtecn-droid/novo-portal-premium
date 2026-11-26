"use client";

import { useEffect, useState } from "react";

export interface RadioStation {
  name: string;
  url: string;
}

export interface RadioConfig {
  enabled: boolean;
  stations: RadioStation[];
}

export const DEFAULT_RADIO_STATIONS: RadioStation[] = [
  {
    name: "Nova FM (demo)",
    url: "https://stream.radioparadise.com/mp3-128",
  },
  {
    name: "Rádio Pop (demo)",
    url: "https://stream-relay-geo.ntslive.net/stream",
  },
  {
    name: "Rádio Beat (demo)",
    url: "https://icecast.radiofrance.fr/fip-midfi.mp3",
  },
];

export const DEFAULT_RADIO: RadioConfig = {
  enabled: true,
  stations: DEFAULT_RADIO_STATIONS,
};

const RADIO_KEY = "portal-nova.radio.v1";

export function loadRadio(): RadioConfig {
  if (typeof window === "undefined") return DEFAULT_RADIO;
  try {
    const raw = window.localStorage.getItem(RADIO_KEY);
    if (!raw) return DEFAULT_RADIO;
    const parsed = JSON.parse(raw) as Partial<RadioConfig>;
    const stations = (Array.isArray(parsed.stations) ? parsed.stations : [])
      .map((s) => ({ name: String(s?.name ?? "").trim(), url: String(s?.url ?? "").trim() }))
      .filter((s) => s.name && s.url.startsWith("http"));
    return {
      enabled: parsed.enabled !== false,
      stations: stations.length > 0 ? stations : DEFAULT_RADIO.stations,
    };
  } catch {
    return DEFAULT_RADIO;
  }
}

export function saveRadio(config: RadioConfig) {
  if (typeof window === "undefined") return;
  const clean: RadioConfig = {
    enabled: config.enabled !== false,
    stations: config.stations
      .map((s) => ({ name: s.name.trim(), url: s.url.trim() }))
      .filter((s) => s.name && s.url.startsWith("http")),
  };
  window.localStorage.setItem(RADIO_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("portal-nova.radio"));
}

export function radioStations(config?: RadioConfig): RadioStation[] {
  const active = config ?? loadRadio();
  return active.stations.length > 0 ? active.stations : DEFAULT_RADIO.stations;
}

export function useRadioConfig(): RadioConfig {
  const [config, setConfig] = useState<RadioConfig>(DEFAULT_RADIO);

  useEffect(() => {
    const load = () => setConfig(loadRadio());
    load();
    window.addEventListener("portal-nova.radio", load);
    return () => window.removeEventListener("portal-nova.radio", load);
  }, []);

  return config;
}
