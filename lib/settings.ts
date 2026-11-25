"use client";

import { useEffect, useState } from "react";
import type { Editoria } from "./types";

export interface PortalSettings {
  portalName: string;
  logoUrl?: string;
  editorias: Editoria[];
}

export const DEFAULT_EDITORIAS: Editoria[] = [
  "Cidade",
  "Política",
  "Economia",
  "Esportes",
  "Entretenimento",
  "Tecnologia",
  "Saúde",
];

const PORTAL_SETTINGS_KEY = "portal-nova.settings.v1";

const DEFAULTS: PortalSettings = {
  portalName: "Nova",
  editorias: DEFAULT_EDITORIAS,
};

export function loadSettings(): PortalSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(PORTAL_SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PortalSettings>;
    return {
      portalName: parsed.portalName?.trim() || DEFAULTS.portalName,
      logoUrl: parsed.logoUrl,
      editorias:
        Array.isArray(parsed.editorias) && parsed.editorias.length > 0
          ? parsed.editorias.map((e) => String(e).trim()).filter(Boolean)
          : DEFAULTS.editorias,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: PortalSettings) {
  if (typeof window === "undefined") return;
  const clean: PortalSettings = {
    portalName: settings.portalName.trim() || DEFAULTS.portalName,
    logoUrl: settings.logoUrl,
    editorias: settings.editorias.map((e) => e.trim()).filter(Boolean),
  };
  window.localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("portal-nova.settings"));
}

export function resetSettings() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PORTAL_SETTINGS_KEY);
  window.dispatchEvent(new CustomEvent("portal-nova.settings"));
}

export function fullPortalName(settings: PortalSettings): string {
  const name = settings.portalName.trim() || DEFAULTS.portalName;
  return /portal/i.test(name) ? name : `Portal ${name}`;
}

export function useSettings(): PortalSettings {
  const [settings, setSettings] = useState<PortalSettings>(DEFAULTS);

  useEffect(() => {
    const load = () => setSettings(loadSettings());
    load();
    window.addEventListener("portal-nova.settings", load);
    return () => window.removeEventListener("portal-nova.settings", load);
  }, []);

  return settings;
}

export function useEditorias(): Editoria[] {
  return useSettings().editorias;
}
