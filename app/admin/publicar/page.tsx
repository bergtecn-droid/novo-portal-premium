"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { MediaField } from "@/components/media-field";
import { MediaRenderer } from "@/components/media-render";
import { EDITORIAS } from "@/lib/seed";
import { getArticle, slugify, upsertArticle } from "@/lib/store";
import type { Article, Block, Editoria, MediaItem, Status } from "@/lib/types";

const blankArticle = (): Article => ({
  id: "",
  slug: "",
  title: "",
  subtitle: "",
  editoria: "Cidade",
  tags: [],
  author: "",
  cover: "",
  coverCaption: "",
  blocks: [],
  publishedAt: new Date().toISOString(),
  status: "rascunho",
  views: 0,
});

const card =
  "rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#0f1a30]";

function SectionHeader({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-neutral-950">
        {n}
      </span>
      <div>
        <h2 className="font-display text-lg font-bold leading-none">{title}</h2>
        {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
      </div>
    </div>
  );
}

const labelCls = "text-sm font-semibold";
const inputCls =
  "mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700";

function PublishForm() {
  const search = useSearchParams();
  const editSlug = search.get("slug");

  const [article, setArticle] = useState<Article>(blankArticle());
  const [tagsText, setTagsText] = useState("");
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    if (editSlug) {
      const existing = getArticle(editSlug);
      if (existing) {
        setArticle(existing);
        setTagsText(existing.tags.join(", "));
      }
    }
  }, [editSlug]);

  const set = <K extends keyof Article>(key: K, value: Article[K]) =>
    setArticle((a) => ({ ...a, [key]: value }));

  const setBlock = (idx: number, block: Block) =>
    set("blocks", article.blocks.map((b, i) => (i === idx ? block : b)));

  const addBlock = (type: Block["type"]) => {
    const block: Block =
      type === "heading"
        ? { type: "heading", content: "Novo subtítulo" }
        : type === "quote"
          ? { type: "quote", content: "Digite a citação…" }
          : type === "image"
            ? {
                type: "image",
                size: "grande",
                media: { captionTop: "Crédito da foto", captionBottom: "Legenda da foto" },
              }
            : type === "video"
              ? {
                  type: "video",
                  media: { captionTop: "Crédito do vídeo", captionBottom: "Legenda do vídeo" },
                }
              : type === "gallery"
                ? { type: "gallery", items: [{}, {}] }
                : { type: "text", content: "Digite o parágrafo aqui…" };
    set("blocks", article.blocks.concat(block));
  };

  const updateMedia = (idx: number, patch: Partial<MediaItem>) => {
    const block = article.blocks[idx];
    if (block.type === "image" || block.type === "video") {
      setBlock(idx, { ...block, media: { ...block.media, ...patch } });
    }
  };

  const updateGalleryItem = (idx: number, j: number, patch: Partial<MediaItem>) => {
    const block = article.blocks[idx];
    if (block.type !== "gallery") return;
    const items = block.items.map((it, k) => (k === j ? { ...it, ...patch } : it));
    setBlock(idx, { ...block, items });
  };

  const save = (status: Status) => {
    const title = article.title.trim() || "Matéria sem título";
    const id = article.id || crypto.randomUUID();
    const slug = article.slug || slugify(title) || id.slice(0, 8);
    upsertArticle({
      ...article,
      id,
      slug,
      title,
      status,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      publishedAt: article.publishedAt,
    });
    window.location.href = "/admin";
  };

  const wordCount = useMemo(
    () =>
      article.blocks
        .map((b) => ("content" in b ? b.content : ""))
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length,
    [article.blocks],
  );

  const coverMedia: MediaItem = {
    src: article.cover || undefined,
    captionBottom: article.coverCaption,
  };
  const patchCover = (patch: Partial<MediaItem>) => {
    if (patch.src !== undefined) set("cover", patch.src);
    if (patch.captionBottom !== undefined) set("coverCaption", patch.captionBottom);
  };

  const blockBadge = (type: Block["type"], i: number) => {
    const map: Record<Block["type"], string> = {
      text: "📄 Parágrafo",
      heading: "🔠 Subtítulo",
      quote: "❝ Citação",
      image: "🖼️ Foto",
      video: "🎬 Vídeo",
      gallery: "🖼️ Galeria",
    };
    return `${i + 1}. ${map[type]}`;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-[#0f1a30]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-display text-lg font-bold">
            ← Nova <span className="text-[var(--accent-strong)]">• Painel</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                preview
                  ? "border-[var(--accent)] text-[var(--accent-strong)] dark:text-[var(--accent-strong)]"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {preview ? "👁 Prévia ativa" : "👁 Prévia"}
            </button>
            <button
              onClick={() => save("rascunho")}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700"
            >
              Salvar rascunho
            </button>
            <button
              onClick={() => save("publicado")}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
            >
              Publicar 🚀
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 xl:grid-cols-2">
        <section className="space-y-5">
          <div className={`${card} p-5`}>
            <SectionHeader
              n="1"
              title="Dados da matéria"
              hint="Título, subtítulo, editoria, autor e tags"
            />
            <input
              value={article.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Título da matéria"
              className="font-display w-full bg-transparent text-3xl font-bold outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
            />
            <input
              value={article.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Subtítulo (linha fina que aparece abaixo do título)"
              className="mt-3 w-full bg-transparent text-lg text-neutral-500 outline-none dark:text-neutral-400"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className={labelCls}>Editoria</span>
                <select
                  value={article.editoria}
                  onChange={(e) => set("editoria", e.target.value as Editoria)}
                  className={inputCls}
                >
                  {EDITORIAS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className={labelCls}>Autor</span>
                <input
                  value={article.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="Nome do autor"
                  className={inputCls}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className={labelCls}>Tags (separadas por vírgula)</span>
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Cidade, Obras, Transporte"
                  className={inputCls}
                />
              </label>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <SectionHeader
              n="2"
              title="Imagem de capa"
              hint="Clique em 'Do computador' para escolher a foto, ou cole um link"
            />
            <MediaField kind="image" media={coverMedia} onPatch={patchCover} singleCaption />
          </div>

          <div className={`${card} p-5`}>
            <SectionHeader
              n="3"
              title="Conteúdo da matéria"
              hint="Escreva o texto e insira fotos, vídeos e galerias onde quiser"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Inserir no texto:</span>
              {[
                ["📄", "Parágrafo", "text"],
                ["🔠", "Subtítulo", "heading"],
                ["❝", "Citação", "quote"],
                ["🖼️", "Foto", "image"],
                ["🎬", "Vídeo", "video"],
                ["🗂️", "Galeria", "gallery"],
              ].map(([icon, label, type]) => (
                <button
                  key={type}
                  onClick={() => addBlock(type as Block["type"])}
                  className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--accent-wash)] dark:bg-neutral-800 dark:hover:bg-[var(--accent-wash)]"
                >
                  {icon} {label}
                </button>
              ))}
              <span className="ml-auto text-xs text-neutral-400">{wordCount} palavras</span>
            </div>

            <div className="mt-4 space-y-4">
              {article.blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-700 dark:bg-neutral-800/40"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {blockBadge(block.type, idx)}
                    <span className="ml-auto flex gap-1">
                      {idx > 0 && (
                        <button
                          onClick={() => {
                            const next = [...article.blocks];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            set("blocks", next);
                          }}
                          className="rounded bg-white px-2 py-0.5 shadow-sm hover:bg-neutral-100 dark:bg-neutral-700"
                        >
                          ↑ subir
                        </button>
                      )}
                      {idx < article.blocks.length - 1 && (
                        <button
                          onClick={() => {
                            const next = [...article.blocks];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            set("blocks", next);
                          }}
                          className="rounded bg-white px-2 py-0.5 shadow-sm hover:bg-neutral-100 dark:bg-neutral-700"
                        >
                          ↓ descer
                        </button>
                      )}
                      <button
                        onClick={() =>
                          set(
                            "blocks",
                            article.blocks.filter((_, i) => i !== idx),
                          )
                        }
                        className="rounded bg-white px-2 py-0.5 text-red-500 shadow-sm hover:bg-neutral-100 dark:bg-neutral-700"
                      >
                        ✕ remover
                      </button>
                    </span>
                  </div>

                  {block.type === "text" && (
                    <textarea
                      value={block.content}
                      onChange={(e) => setBlock(idx, { ...block, content: e.target.value })}
                      rows={4}
                      className="w-full resize-y rounded-lg border border-neutral-200 bg-transparent p-3 text-sm leading-6 dark:border-neutral-700"
                    />
                  )}
                  {block.type === "heading" && (
                    <input
                      value={block.content}
                      onChange={(e) => setBlock(idx, { ...block, content: e.target.value })}
                      className="font-display w-full rounded-lg border border-neutral-200 bg-transparent p-2 text-lg font-bold dark:border-neutral-700"
                    />
                  )}
                  {block.type === "quote" && (
                    <textarea
                      value={block.content}
                      onChange={(e) => setBlock(idx, { ...block, content: e.target.value })}
                      rows={2}
                      className="w-full resize-y rounded-lg border border-neutral-200 bg-transparent p-3 text-sm italic dark:border-neutral-700"
                    />
                  )}
                  {block.type === "image" && (
                    <MediaField
                      kind="image"
                      media={block.media}
                      onPatch={(patch) => updateMedia(idx, patch)}
                    />
                  )}
                  {block.type === "video" && (
                    <MediaField
                      kind="video"
                      media={block.media}
                      onPatch={(patch) => updateMedia(idx, patch)}
                    />
                  )}
                  {block.type === "gallery" && (
                    <div className="space-y-3">
                      {block.items.map((item, j) => (
                        <div
                          key={j}
                          className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-[#0f1a30]"
                        >
                          <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                            Foto {j + 1}
                          </div>
                          <MediaField
                            kind="image"
                            media={item}
                            onPatch={(patch) => updateGalleryItem(idx, j, patch)}
                            singleCaption
                          />
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const g = article.blocks[idx] as Extract<Block, { type: "gallery" }>;
                            setBlock(idx, { ...g, items: [...g.items, {}] });
                          }}
                          className="flex-1 rounded-lg border border-dashed border-neutral-300 py-2 text-xs font-semibold text-neutral-500 hover:border-[var(--accent)] dark:border-neutral-600"
                        >
                          + Adicionar foto à galeria
                        </button>
                        {block.items.length > 1 && (
                          <button
                            onClick={() => {
                              const g = article.blocks[idx] as Extract<Block, { type: "gallery" }>;
                              setBlock(idx, { ...g, items: g.items.slice(0, -1) });
                            }}
                            className="rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-red-500 hover:border-red-400 dark:border-neutral-600"
                          >
                            − Remover última
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {article.blocks.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400 dark:border-neutral-700">
                  A matéria está sem conteúdo. Use os botões acima para inserir o primeiro bloco.
                </p>
              )}
            </div>
          </div>
        </section>

        {preview && (
          <section className="xl:sticky xl:top-20 xl:self-start">
            <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">
              Prévia — como fica no portal
            </h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#0f1a30]">
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-950">
                {article.editoria}
              </span>
              <h1 className="font-display mt-3 text-3xl font-bold leading-tight">
                {article.title || "Título da matéria"}
              </h1>
              <p className="mt-2 text-lg text-neutral-500 dark:text-neutral-400">
                {article.subtitle || "Subtítulo da matéria…"}
              </p>
              {article.cover && <img src={article.cover} alt="" className="mt-4 w-full rounded-xl" />}
              <div className="mt-6">
                <MediaRenderer blocks={article.blocks} />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function PublicarPage() {
  return (
    <Suspense fallback={null}>
      <PublishForm />
    </Suspense>
  );
}
