"use client";

import type { Article } from "./types";
import { seedArticles } from "./seed";

const KEY = "portal-nova.articles.v1";
const ACTIONS_KEY = "portal-nova.quickActions.v1";

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
  return [...read()].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export function publishedArticles(): Article[] {
  return listArticles().filter((a) => a.status === "publicado");
}

export function getArticle(slug: string): Article | undefined {
  return listArticles().find((a) => a.slug === slug);
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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTime(article: Article): number {
  const words = article.blocks
    .map((b) => {
      if (b.type === "text" || b.type === "heading" || b.type === "quote")
        return b.content;
      return "";
    })
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
