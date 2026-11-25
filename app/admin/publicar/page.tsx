"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { MediaRenderer } from "@/components/media-render";
import { EDITORIAS } from "@/lib/seed";
import { getArticle, listArticles, slugify, upsertArticle } from "@/lib/store";
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
                media: {
                  src: `https://picsum.photos/seed/${Date.now()}/1200/720`,
                  captionTop: "Crédito da foto",
                  captionBottom: "Legenda da foto",
                },
              }
            : type === "video"
              ? {
                  type: "video",
                  media: {
                    youtubeId: "",
                    captionTop: "Crédito do vídeo",
                    captionBottom: "Legenda do vídeo",
                  },
                }
              : type === "gallery"
                ? {
                    type: "gallery",
                    items: [
                      {
                        src: `https://picsum.photos/seed/${Date.now()}a/900/640`,
                        captionTop: "Legenda de cima",
                        captionBottom: "Legenda de baixo",
                      },
                      {
                        src: `https://picsum.photos/seed/${Date.now()}b/900/640`,
                        captionTop: "Legenda de cima",
                        captionBottom: "Legenda de baixo",
                      },
                    ],
                  }
                : { type: "text", content: "Digite o parágrafo aqui…" };
    set("blocks", article.blocks.concat(block));
  };

  const updateMedia = (idx: number, patch: Partial<MediaItem>) => {
    const block = article.blocks[idx];
    if (block.type === "image" || block.type === "video") {
      setBlock(idx, { ...block, media: { ...block.media, ...patch } });
    }
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0f1a30]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-display text-lg font-bold">
            ← Nova <span className="text-amber-500">• Painel</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                preview
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
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
        <section className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0f1a30]">
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
          </div>

          <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-2 dark:border-neutral-800 dark:bg-[#0f1a30]">
            <label className="text-sm">
              <span className="font-semibold">Editoria</span>
              <select
                value={article.editoria}
                onChange={(e) => set("editoria", e.target.value as Editoria)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
              >
                {EDITORIAS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-semibold">Autor</span>
              <input
                value={article.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Nome do autor"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="font-semibold">Tags (separadas por vírgula)</span>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Cidade, Obras, Transporte"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
              />
            </label>
            <div className="sm:col-span-2">
              <span className="text-sm font-semibold">Imagem de capa</span>
              <input
                value={article.cover}
                onChange={(e) => set("cover", e.target.value)}
                placeholder="URL da imagem (https://…)"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              />
              <input
                value={article.coverCaption}
                onChange={(e) => set("coverCaption", e.target.value)}
                placeholder="Legenda da capa (aparece abaixo)"
                className="mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0f1a30]">
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
                  className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold transition hover:bg-amber-100 dark:bg-neutral-800 dark:hover:bg-amber-900/40"
                >
                  {icon} {label}
                </button>
              ))}
              <span className="ml-auto text-xs text-neutral-400">
                {wordCount} palavras
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {article.blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {block.type === "text" && "📄 Parágrafo"}
                    {block.type === "heading" && "🔠 Subtítulo"}
                    {block.type === "quote" && "❝ Citação"}
                    {block.type === "image" && "🖼️ Foto"}
                    {block.type === "video" && "🎬 Vídeo"}
                    {block.type === "gallery" && "🗂️ Galeria"}
                    <span className="ml-auto flex gap-1">
                      <button
                        onClick={() =>
                          set(
                            "blocks",
                            article.blocks.filter((_, i) => i !== idx),
                          )
                        }
                        className="text-red-500 hover:underline"
                      >
                        remover
                      </button>
                      {idx > 0 && (
                        <button
                          onClick={() => {
                            const next = [...article.blocks];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            set("blocks", next);
                          }}
                        >
                          ↑
                        </button>
                      )}
                      {idx < article.blocks.length - 1 && (
                        <button
                          onClick={() => {
                            const next = [...article.blocks];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            set("blocks", next);
                          }}
                        >
                          ↓
                        </button>
                      )}
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
                  {(block.type === "image" || block.type === "video") && (
                    <div className="space-y-2">
                      <input
                        value={block.media.youtubeId ?? block.media.src}
                        onChange={(e) =>
                          updateMedia(
                            idx,
                            block.type === "video"
                              ? { youtubeId: e.target.value }
                              : { src: e.target.value },
                          )
                        }
                        placeholder={
                          block.type === "video"
                            ? "Link do YouTube (ID do vídeo) ou caminho do MP4"
                            : "URL da imagem"
                        }
                        className="w-full rounded-lg border border-neutral-200 bg-transparent p-2 text-sm dark:border-neutral-700"
                      />
                      <input
                        value={block.media.captionTop ?? ""}
                        onChange={(e) => updateMedia(idx, { captionTop: e.target.value })}
                        placeholder="Legenda de CIMA (ex: crédito da foto)"
                        className="w-full rounded-lg border border-neutral-200 bg-transparent p-2 text-sm dark:border-neutral-700"
                      />
                      <input
                        value={block.media.captionBottom ?? ""}
                        onChange={(e) => updateMedia(idx, { captionBottom: e.target.value })}
                        placeholder="Legenda de BAIXO (ex: descrição da cena)"
                        className="w-full rounded-lg border border-neutral-200 bg-transparent p-2 text-sm dark:border-neutral-700"
                      />
                    </div>
                  )}
                  {block.type === "gallery" && (
                    <div className="space-y-3">
                      {block.items.map((item, j) => (
                        <div
                          key={j}
                          className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                            Foto {j + 1}
                            <button
                              onClick={() => {
                                const next = [...article.blocks];
                                const g = next[idx] as Extract<Block, { type: "gallery" }>;
                                g.items = g.items.filter((_, k) => k !== j);
                                setBlock(idx, { ...g });
                              }}
                              className="text-red-500 hover:underline"
                            >
                              remover
                            </button>
                          </div>
                          <input
                            value={item.src}
                            onChange={(e) => {
                              const next = [...article.blocks];
                              const g = next[idx] as Extract<Block, { type: "gallery" }>;
                              g.items[j] = { ...g.items[j], src: e.target.value };
                              setBlock(idx, { ...g });
                            }}
                            placeholder="URL da imagem"
                            className="mt-1 w-full rounded border border-neutral-200 bg-transparent p-1.5 text-xs dark:border-neutral-700"
                          />
                          <input
                            value={item.captionTop ?? ""}
                            onChange={(e) => {
                              const next = [...article.blocks];
                              const g = next[idx] as Extract<Block, { type: "gallery" }>;
                              g.items[j] = { ...g.items[j], captionTop: e.target.value };
                              setBlock(idx, { ...g });
                            }}
                            placeholder="Legenda de cima"
                            className="mt-1 w-full rounded border border-neutral-200 bg-transparent p-1.5 text-xs dark:border-neutral-700"
                          />
                          <input
                            value={item.captionBottom ?? ""}
                            onChange={(e) => {
                              const next = [...article.blocks];
                              const g = next[idx] as Extract<Block, { type: "gallery" }>;
                              g.items[j] = { ...g.items[j], captionBottom: e.target.value };
                              setBlock(idx, { ...g });
                            }}
                            placeholder="Legenda de baixo"
                            className="mt-1 w-full rounded border border-neutral-200 bg-transparent p-1.5 text-xs dark:border-neutral-700"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const next = [...article.blocks];
                          const g = next[idx] as Extract<Block, { type: "gallery" }>;
                          g.items.push({
                            src: `https://picsum.photos/seed/${Date.now()}/900/640`,
                            captionTop: "",
                            captionBottom: "",
                          });
                          setBlock(idx, { ...g });
                        }}
                        className="w-full rounded-lg border border-dashed border-neutral-300 py-2 text-xs font-semibold text-neutral-500 hover:border-amber-500 dark:border-neutral-600"
                      >
                        + Adicionar foto à galeria
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {preview && (
          <section className="xl:sticky xl:top-20 xl:self-start">
            <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">
              Prévia — como fica no portal
            </h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#0f1a30]">
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-950">
                {article.editoria}
              </span>
              <h1 className="font-display mt-3 text-3xl font-bold leading-tight">
                {article.title || "Título da matéria"}
              </h1>
              <p className="mt-2 text-lg text-neutral-500 dark:text-neutral-400">
                {article.subtitle || "Subtítulo da matéria…"}
              </p>
              {article.cover && (
                <img
                  src={article.cover}
                  alt=""
                  className="mt-4 w-full rounded-xl"
                />
              )}
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
