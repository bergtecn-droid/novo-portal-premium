"use client";

import { useEffect, useState } from "react";
import type { Editoria } from "./types";

export interface InstLink {
  label: string;
  url?: string;
}

export interface InstPage {
  slug: string;
  title: string;
  content: string;
}

export type BannerPosition = "topo" | "lateral" | "materia";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  position: BannerPosition;
}

export interface PortalSettings {
  portalName: string;
  logoUrl?: string;
  editorias: Editoria[];
  tagline?: string;
  instLinks?: InstLink[];
  pages?: InstPage[];
  banners?: Banner[];
  contactWhatsapp?: string;
}

export interface PortalSettings {
  portalName: string;
  logoUrl?: string;
  editorias: Editoria[];
  tagline?: string;
  instLinks?: InstLink[];
  pages?: InstPage[];
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

export const DEFAULT_TAGLINE =
  "Jornalismo local com clareza, profundidade e rapidez. Feito para informar todos os dias.";

export const DEFAULT_INST_LINKS: InstLink[] = [
  { label: "Quem somos", url: "/p/quem-somos" },
  { label: "Anuncie aqui", url: "/p/anuncie-aqui" },
  { label: "Fale com a redação", url: "/p/fale-com-a-redacao" },
];

export const DEFAULT_PAGES: InstPage[] = [
  {
    slug: "quem-somos",
    title: "Quem somos",
    content:
      "Somos um portal de notícias feito para a nossa cidade e região.\n\n**Nossa missão** é informar todos os dias com clareza, profundidade e rapidez: o que acontece na cidade, na política, na economia, no esporte e na cultura da nossa gente.\n\nTrabalhamos com **jornalismo responsável**: checamos as informações antes de publicar, respeitamos as pessoas e damos espaço para todos os lados da história.\n\nQuer falar com a gente? Use a página **Fale com a redação** — lemos todas as mensagens.",
  },
  {
    slug: "anuncie-aqui",
    title: "Anuncie aqui",
    content:
      "Seu negócio visto por milhares de pessoas todos os dias.\n\nO portal oferece espaços publicitários para empresas, lojas, serviços e eventos da região:\n\n- **Banner na página inicial** — alta visibilidade todos os dias\n- **Matéria patrocinada** — seu negócio contado como notícia\n- **Anúncio nas matérias** — aparece enquanto o leitor lê\n\n**Quer anunciar?** Fale com a nossa equipe pela página **Fale com a redação** ou pelo WhatsApp. Montamos o plano que cabe no seu orçamento.",
  },
  {
    slug: "fale-com-a-redacao",
    title: "Fale com a redação",
    content:
      "Sugestão de pauta, correção, dúvida ou anúncio? A gente quer ouvir você.\n\n- **WhatsApp da redação:** (00) 00000-0000\n- **E-mail:** contato@seuportal.com.br\n- **Atendimento:** todos os dias\n\n**Sugestões de pauta** são sempre bem-vindas: viu alguma coisa acontecendo na cidade? Conta pra gente!\n\nSe você é **assinante/leitor** e encontrou algum erro em uma matéria, pode contar conosco também: corrigimos com transparência.",
  },
];

const PORTAL_SETTINGS_KEY = "portal-nova.settings.v1";

const DEFAULTS: PortalSettings = {
  portalName: "Nova",
  editorias: DEFAULT_EDITORIAS,
  tagline: DEFAULT_TAGLINE,
  instLinks: DEFAULT_INST_LINKS,
  pages: DEFAULT_PAGES,
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
      tagline:
        typeof parsed.tagline === "string" ? parsed.tagline : DEFAULTS.tagline,
      instLinks:
        Array.isArray(parsed.instLinks) && parsed.instLinks.length > 0
          ? parsed.instLinks
              .map((l) => ({
                label: String(l?.label ?? "").trim(),
                url: typeof l?.url === "string" ? l.url.trim() : undefined,
              }))
              .filter((l) => l.label)
          : DEFAULTS.instLinks,
      pages:
        Array.isArray(parsed.pages) && parsed.pages.length > 0
          ? parsed.pages.map((p) => ({
              slug: String(p?.slug ?? "").trim(),
              title: String(p?.title ?? "").trim(),
              content: String(p?.content ?? ""),
            }))
          : DEFAULTS.pages,
      banners:
        Array.isArray(parsed.banners)
          ? parsed.banners
              .map((b) => ({
                id: String(b?.id ?? "").trim(),
                title: String(b?.title ?? "").trim(),
                imageUrl: String(b?.imageUrl ?? ""),
                linkUrl:
                  typeof b?.linkUrl === "string" && b.linkUrl.trim()
                    ? b.linkUrl.trim()
                    : undefined,
                active: b?.active !== false,
                position: (b?.position === "materia"
                  ? "materia"
                  : b?.position === "lateral"
                    ? "lateral"
                    : "topo") as BannerPosition,
              }))
              .filter((b) => b.id && b.imageUrl)
          : [],
      contactWhatsapp:
        typeof parsed.contactWhatsapp === "string"
          ? parsed.contactWhatsapp
          : undefined,
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
    tagline: settings.tagline?.trim() || DEFAULTS.tagline,
    instLinks: (settings.instLinks ?? [])
      .map((l) => ({
        label: l.label.trim(),
        url: l.url?.trim() || undefined,
      }))
      .filter((l) => l.label),
    pages: (settings.pages ?? []).map((p) => ({
      slug: p.slug.trim(),
      title: p.title.trim(),
      content: p.content,
    })),
    banners: (settings.banners ?? []).filter(
      (b) => b.id && b.imageUrl,
    ),
    contactWhatsapp: settings.contactWhatsapp?.trim() || undefined,
  };
  window.localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("portal-nova.settings"));
  fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings: clean }),
  }).catch(() => {});
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
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { settings?: PortalSettings | null } | null) => {
        const remote = d?.settings;
        if (remote && typeof remote === "object" && remote.portalName) {
          window.localStorage.setItem(
            PORTAL_SETTINGS_KEY,
            JSON.stringify(remote),
          );
          setSettings(loadSettings());
        }
      })
      .catch(() => {});
    return () => window.removeEventListener("portal-nova.settings", load);
  }, []);

  return settings;
}

export function useEditorias(): Editoria[] {
  return useSettings().editorias;
}
