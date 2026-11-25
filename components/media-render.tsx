"use client";

import { useState } from "react";
import { RichText } from "@/lib/rich";
import type { Align, Block, MediaItem } from "@/lib/types";

const alignStyle = (align?: Align) =>
  align === "center"
    ? { textAlign: "center" as const }
    : align === "right"
      ? { textAlign: "right" as const }
      : undefined;

function Caption({ text, position }: { text?: string; position: "top" | "bottom" }) {
  if (!text) return null;
  return (
    <p
      className={
        position === "top"
          ? "mb-1.5 text-xs font-bold uppercase tracking-widest text-[var(--accent-strong)] dark:text-[var(--accent-strong)]"
          : "mt-2 border-l-2 border-[var(--accent)] pl-3 text-sm italic text-neutral-500 dark:text-neutral-400"
      }
    >
      {text}
    </p>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  if (index === null) return null;
  const item = items[index];
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 p-4"
      onClick={onClose}
    >
      <button
        className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
        onClick={onClose}
      >
        Fechar ✕
      </button>
      <img
        src={item.src}
        alt={item.captionBottom ?? ""}
        className="max-h-[75vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="mt-4 flex items-center gap-4 text-sm text-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="rounded-full bg-white/10 px-3 py-1"
          onClick={() => onNav((index - 1 + items.length) % items.length)}
        >
          ← Anterior
        </button>
        <span>
          {index + 1} de {items.length}
        </span>
        <button
          className="rounded-full bg-white/10 px-3 py-1"
          onClick={() => onNav((index + 1) % items.length)}
        >
          Próxima →
        </button>
      </div>
      <p className="mt-3 max-w-2xl text-center text-sm italic text-neutral-400">
        {[item.captionTop, item.captionBottom].filter(Boolean).join(" — ")}
      </p>
    </div>
  );
}

export function MediaRenderer({ blocks }: { blocks: Block[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([]);

  const openLightbox = (items: MediaItem[], index: number) => {
    setLightboxItems(items);
    setLightbox(index);
  };

  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                style={alignStyle(block.align)}
                className={
                  block.level === 3
                    ? "font-display pt-4 text-xl font-bold text-neutral-900 dark:text-white"
                    : "font-display pt-4 text-2xl font-bold text-neutral-900 dark:text-white"
                }
              >
                {block.content}
              </h2>
            );
          case "text":
            return (
              <div key={i} style={alignStyle(block.align)}>
                <RichText
                  text={block.content}
                  className="space-y-4 text-[17px] leading-8 text-neutral-700 dark:text-neutral-300"
                />
              </div>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                style={alignStyle(block.align)}
                className="rounded-r-xl border-l-4 border-[var(--accent)] bg-[var(--accent-wash)] py-4 pl-5 pr-4 dark:bg-neutral-800/60"
              >
                <div className="font-display text-xl italic leading-relaxed text-neutral-800 dark:text-neutral-200">
                  “
                  <RichText text={block.content} className="inline" />
                  ”
                </div>
                {block.author && (
                  <footer className="mt-2 text-sm font-semibold text-[var(--accent-strong)] dark:text-[var(--accent-strong)]">
                    — {block.author}
                  </footer>
                )}
              </blockquote>
            );
          case "image":
            return (
              <figure
                key={i}
                className={
                  block.size === "medio" ? "mx-auto max-w-xl" : "w-full"
                }
              >
                <Caption text={block.media.captionTop} position="top" />
                <img
                  src={block.media.src}
                  alt={block.media.captionBottom ?? ""}
                  className="w-full cursor-zoom-in rounded-xl shadow-md"
                  onClick={() => openLightbox([block.media], 0)}
                />
                <Caption text={block.media.captionBottom} position="bottom" />
              </figure>
            );
          case "video":
            return (
              <figure key={i} className="w-full">
                <Caption text={block.media.captionTop} position="top" />
                <div className="aspect-video w-full overflow-hidden rounded-xl shadow-md">
                  {block.media.youtubeId ? (
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${block.media.youtubeId}`}
                      title="Vídeo"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="h-full w-full"
                      src={block.media.src}
                      controls
                    />
                  )}
                </div>
                <Caption text={block.media.captionBottom} position="bottom" />
              </figure>
            );
          case "gallery":
            return (
              <div key={i}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {block.items.map((item, j) => (
                    <figure
                      key={j}
                      className="group cursor-zoom-in"
                      onClick={() => openLightbox(block.items, j)}
                    >
                      <Caption text={item.captionTop} position="top" />
                      <div className="relative overflow-hidden rounded-xl shadow-sm">
                        <img
                          src={item.src}
                          alt={item.captionBottom ?? ""}
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute right-2 top-2 rounded-full bg-neutral-950/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {j + 1}/{block.items.length}
                        </span>
                      </div>
                      <Caption text={item.captionBottom} position="bottom" />
                    </figure>
                  ))}
                </div>
                <Lightbox
                  items={lightboxItems}
                  index={lightbox}
                  onClose={() => setLightbox(null)}
                  onNav={setLightbox}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
