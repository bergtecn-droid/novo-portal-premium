import { createHash } from "node:crypto";
import { head, put } from "@vercel/blob";
import type { Article, Block, MediaItem } from "./types";
import type { PortalSettings } from "./settings";

const FILE_NAME = "published-articles.json";
const SETTINGS_FILE_NAME = "portal-settings.json";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

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

function parseDataUrl(value: string) {
  const match = /^data:([-\w.+/]+);base64,(.+)$/s.exec(value.trim());
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) return null;
  return { mime, ext, buffer: Buffer.from(match[2], "base64") };
}

async function toCloudUrl(value: string): Promise<string> {
  if (!value || !value.startsWith("data:")) return value;
  if (!storageActive()) return value;
  const parsed = parseDataUrl(value);
  if (!parsed || parsed.buffer.byteLength === 0) return value;
  const hash = createHash("sha1")
    .update(parsed.buffer)
    .digest("hex")
    .slice(0, 20);
  const blob = await put(`uploads/${hash}.${parsed.ext}`, parsed.buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: parsed.mime,
  });
  return blob.url;
}

async function toCloudMedia(media: MediaItem): Promise<MediaItem> {
  if (!media.src) return media;
  return { ...media, src: await toCloudUrl(media.src) };
}

export async function materializeArticleMedia(
  article: Article,
): Promise<Article> {
  if (!storageActive()) return article;
  const cover = await toCloudUrl(article.cover);
  const blocks: Block[] = [];
  for (const block of article.blocks) {
    if (block.type === "image" || block.type === "video") {
      blocks.push({
        ...block,
        media: await toCloudMedia(block.media),
      });
    } else if (block.type === "gallery") {
      blocks.push({
        ...block,
        items: await Promise.all(block.items.map(toCloudMedia)),
      });
    } else {
      blocks.push(block);
    }
  }
  return { ...article, cover, blocks };
}

export async function readPortalSettings(): Promise<PortalSettings | null> {
  if (!storageActive()) return null;
  try {
    const info = await head(SETTINGS_FILE_NAME);
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { settings?: PortalSettings };
    return data.settings ?? null;
  } catch {
    return null;
  }
}

export async function writePortalSettings(
  settings: PortalSettings,
): Promise<void> {
  if (!storageActive()) return;
  await put(SETTINGS_FILE_NAME, JSON.stringify({ settings }, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function materializePortalSettings(
  settings: PortalSettings,
): Promise<PortalSettings> {
  if (!storageActive()) return settings;
  const banners = await Promise.all(
    (settings.banners ?? []).map(async (b) => ({
      ...b,
      imageUrl: await toCloudUrl(b.imageUrl),
    })),
  );
  const logoUrl = settings.logoUrl
    ? await toCloudUrl(settings.logoUrl)
    : settings.logoUrl;
  return { ...settings, banners, logoUrl };
}

export async function writePublished(articles: Article[]): Promise<void> {
  if (!storageActive()) return;
  await put(FILE_NAME, JSON.stringify({ articles }, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
