import { head, put } from "@vercel/blob";
import type { Article } from "./types";

const FILE_NAME = "published-articles.json";

export function storageActive(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readPublished(): Promise<Article[]> {
  if (!storageActive()) return [];
  try {
    const info = await head(FILE_NAME);
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { articles?: Article[] };
    return Array.isArray(data.articles) ? data.articles : [];
  } catch {
    return [];
  }
}

export async function writePublished(articles: Article[]): Promise<void> {
  if (!storageActive()) return;
  await put(FILE_NAME, JSON.stringify({ articles }, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
