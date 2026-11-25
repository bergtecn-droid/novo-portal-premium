"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publishedArticles } from "@/lib/store";
import { useSettings } from "@/lib/settings";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  const editorias = settings.editorias;

  useEffect(() => {
    const load = () =>
      setHeadlines(publishedArticles().slice(0, 6).map((a) => a.title));
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, []);

  const tickerItems = [...headlines, ...headlines];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-[#0b1120]/90">
      <div className="ticker overflow-hidden bg-[var(--accent)] text-[13px] font-semibold text-neutral-950">
        <div className="flex items-center gap-3 px-4 py-1.5">
          <span className="relative z-10 shrink-0 rounded-full bg-neutral-950 px-2 py-0.5 text-[11px] uppercase tracking-wide text-[var(--accent-strong)]">
            Últimas
          </span>
          <div
            className="relative flex-1 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 14px, black calc(100% - 24px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 14px, black calc(100% - 24px), transparent)",
            }}
          >
            <div className="ticker-track gap-10 whitespace-nowrap">
              {tickerItems.map((t, i) => (
                <span key={i} className="opacity-90">
                  • {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="theme-banner" aria-hidden />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.portalName}
              className="h-9 w-auto max-w-[190px] object-contain"
            />
          ) : (
            <>
              <span className="font-display text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {settings.portalName}
              </span>
              <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neutral-950">
                Portal
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {editorias.map((e) => (
            <Link
              key={e}
              href={`/editoria/${encodeURIComponent(e.toLowerCase())}`}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-[var(--accent-wash)] hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-[var(--accent-strong)]"
            >
              {e}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/admin"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-[var(--accent-strong)] shadow-sm transition hover:bg-neutral-700 dark:bg-[var(--accent)] dark:text-neutral-950 dark:hover:bg-[var(--accent-soft)]"
          >
            Admin
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 md:hidden dark:border-neutral-700"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid grid-cols-2 gap-1 border-t border-neutral-200 px-4 py-3 md:hidden dark:border-neutral-800">
          {editorias.map((e) => (
            <Link
              key={e}
              href={`/editoria/${encodeURIComponent(e.toLowerCase())}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {e}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
