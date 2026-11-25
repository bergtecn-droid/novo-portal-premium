import type { Article } from "./types";

export function sortArticles(list: Article[]): Article[] {
  return [...list].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export function findArticle(
  list: Article[],
  slug: string,
): Article | undefined {
  return list.find((a) => a.slug === slug);
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
