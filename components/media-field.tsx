"use client";

import { useRef, useState } from "react";
import type { MediaItem } from "@/lib/types";
import { fileToDataUrl, fileToResizedDataUrl, youtubeIdFrom } from "@/lib/image";

type Tab = "computador" | "internet";

const fieldInput =
  "w-full rounded-lg border border-neutral-200 bg-transparent p-2 text-sm dark:border-neutral-700";

export function MediaField({
  kind,
  media,
  onPatch,
  singleCaption = false,
}: {
  kind: "image" | "video";
  media: MediaItem;
  onPatch: (patch: Partial<MediaItem>) => void;
  singleCaption?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("computador");
  const [status, setStatus] = useState<{ type: "info" | "warn"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus(null);
    if (kind === "image") {
      try {
        setLoading(true);
        const dataUrl = await fileToResizedDataUrl(file);
        onPatch({ src: dataUrl, youtubeId: undefined });
        setStatus({
          type: "info",
          text: "✅ Foto otimizada e salva no rascunho.",
        });
      } catch {
        setStatus({ type: "warn", text: "❌ Não foi possível carregar a imagem." });
      } finally {
        setLoading(false);
      }
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setStatus({
        type: "warn",
        text: `⚠️ Vídeo de ${(file.size / 1048576).toFixed(1)} MB é grande demais para o armazenamento do navegador. Publique no YouTube (grátis) e volte para a aba "Da internet" — o player fica idêntico.`,
      });
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onPatch({ src: dataUrl, youtubeId: undefined });
      setStatus({ type: "info", text: "✅ Vídeo carregado do computador." });
    } catch {
      setStatus({ type: "warn", text: "❌ Não foi possível carregar o vídeo." });
    } finally {
      setLoading(false);
    }
  };

  const handleUrl = (raw: string) => {
    const value = raw.trim();
    setStatus(null);
    const yt = youtubeIdFrom(value);
    if (kind === "video" && yt) {
      onPatch({ youtubeId: yt, src: undefined });
    } else {
      onPatch({ src: value, youtubeId: undefined });
    }
  };

  const preview = media.youtubeId
    ? `https://img.youtube.com/vi/${media.youtubeId}/mqdefault.jpg`
    : media.src;

  const tabBtn = (id: Tab, label: string, emoji: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        tab === id
          ? "bg-[var(--accent)] text-neutral-950"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {emoji} {label}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {tabBtn("computador", "Do computador", kind === "image" ? "📁" : "🎥")}
        {tabBtn("internet", "Da internet (link)", "🔗")}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        className="hidden"
        onChange={async (e) => {
          await handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {tab === "computador" ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm transition hover:border-[var(--accent)] hover:bg-[var(--accent-wash)] dark:border-neutral-600 dark:bg-neutral-800/40"
        >
          {loading ? (
            <span className="font-semibold text-neutral-500">Carregando… ⏳</span>
          ) : (
            <>
              <span className="text-2xl">{kind === "image" ? "🖼️" : "🎬"}</span>
              <span className="font-semibold">
                {preview ? "Trocar — " : ""}clique para escolher{" "}
                {kind === "image" ? "a foto" : "o vídeo"} 👆
              </span>
              <span className="text-xs text-neutral-400">
                {kind === "image"
                  ? "JPG ou PNG (a foto é otimizada automaticamente)"
                  : "MP4 até 3 MB (maiores: use YouTube)"}
              </span>
            </>
          )}
        </button>
      ) : (
        <input
          type="url"
          value={media.src ?? (media.youtubeId ? `https://youtu.be/${media.youtubeId}` : "")}
          onChange={(e) => handleUrl(e.target.value)}
          placeholder={
            kind === "video"
              ? "Cole o link do YouTube (ex: https://youtube.com/watch?v=…)"
              : "Cole o link da imagem (https://…)"
          }
          className={fieldInput}
        />
      )}

      {status && (
        <p
          className={`rounded-lg px-3 py-2 text-xs ${
            status.type === "warn"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {status.text}
        </p>
      )}

      {preview && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
          <img src={preview} alt="" className="h-32 w-full object-cover" />
        </div>
      )}

      {singleCaption ? (
        <input
          value={media.captionBottom ?? ""}
          onChange={(e) => onPatch({ captionBottom: e.target.value })}
          placeholder="Legenda da foto (crédito e descrição)"
          className={fieldInput}
        />
      ) : (
        <>
          <input
            value={media.captionTop ?? ""}
            onChange={(e) => onPatch({ captionTop: e.target.value })}
            placeholder="Legenda de CIMA (ex: crédito da foto)"
            className={fieldInput}
          />
          <input
            value={media.captionBottom ?? ""}
            onChange={(e) => onPatch({ captionBottom: e.target.value })}
            placeholder="Legenda de BAIXO (ex: descrição da cena)"
            className={fieldInput}
          />
        </>
      )}
    </div>
  );
}
