"use client";

import { useEffect, useState } from "react";
import type { Article } from "./types";
import { seedArticles } from "./seed";
import { sortArticles, slugify, findArticle } from "./articles";

const KEY = "portal-nova.articles.v1";
const ACTIONS_KEY = "portal-nova.quickActions.v1";

export {
  sortArticles,
  findArticle,
  slugify,
  readingTime,
  formatDate,
} from "./articles";

let cache: Article[] | null = null;

function read(): Article[] {
  if (typeof window === "undefined") return seedArticles;
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as Article[];
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = seedArticles;
  return cache;
}

function write(articles: Article[]) {
  cache = articles;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(articles));
    window.dispatchEvent(new Event("portal-nova.update"));
  }
}

export function listArticles(): Article[] {
  return sortArticles(read());
}

export function publishedArticles(): Article[] {
  return listArticles().filter((a) => a.status === "publicado");
}

export function getArticle(slug: string): Article | undefined {
  return findArticle(listArticles(), slug);
}

export function upsertArticle(article: Article) {
  const all = read();
  const idx = all.findIndex((a) => a.id === article.id);
  if (idx >= 0) all[idx] = article;
  else all.push(article);
  write(all);
}

export function deleteArticle(id: string) {
  write(read().filter((a) => a.id !== id));
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const defaultQuickActions: QuickAction[] = [
  { id: "pub", label: "Publicar matéria", icon: "✍️", href: "/admin/publicar" },
  { id: "list", label: "Gerenciar matérias", icon: "📋", href: "/admin#materias" },
  { id: "site", label: "Ver o portal", icon: "🌐", href: "/" },
  { id: "stats", label: "Audiência", icon: "📈", href: "/admin#audiencia" },
];

export function listQuickActions(): QuickAction[] {
  if (typeof window === "undefined") return defaultQuickActions;
  const raw = localStorage.getItem(ACTIONS_KEY);
  if (!raw) return defaultQuickActions;
  try {
    return JSON.parse(raw) as QuickAction[];
  } catch {
    return defaultQuickActions;
  }
}

export function saveQuickActions(actions: QuickAction[]) {
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
  window.dispatchEvent(new Event("portal-nova.update"));
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  articles: Article[];
  quickActions?: QuickAction[];
}

export function exportBackup(): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      articles: read(),
      quickActions: listQuickActions(),
    },
    null,
    2,
  );
}

export function parseBackup(text: string): BackupPayload | null {
  try {
    const data = JSON.parse(text) as BackupPayload;
    if (!data || !Array.isArray(data.articles)) return null;
    const valid = data.articles.every(
      (a) => a && typeof a.id === "string" && typeof a.title === "string",
    );
    return valid ? data : null;
  } catch {
    return null;
  }
}

export function restoreBackup(data: BackupPayload) {
  write(data.articles);
  if (Array.isArray(data.quickActions) && data.quickActions.length > 0) {
    saveQuickActions(data.quickActions);
  }
}

export function mergeWithRemote(local: Article[], remote: Article[]): Article[] {
  const byId = new Map(local.map((a) => [a.id, a]));
  for (const a of remote) if (!byId.has(a.id)) byId.set(a.id, a);
  return sortArticles([...byId.values()]);
}

export function usePublishedArticles(): Article[] {
  const [local, setLocal] = useState<Article[]>([]);
  const [remote, setRemote] = useState<Article[]>([]);

  useEffect(() => {
    const load = () => setLocal(publishedArticles());
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, []);

  useEffect(() => {
    fetch("/api/published")
      .then((r) => (r.ok ? r.json() : { articles: [] }))
      .then((d) => setRemote(Array.isArray(d.articles) ? d.articles : []))
      .catch(() => {});
  }, []);

  return mergeWithRemote(local, remote);
}

export async function syncArticleToServer(article: Article): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteArticleFromServer(slug: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/sync", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
