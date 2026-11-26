"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { publishedArticles } from "@/lib/store";
import type { Article } from "@/lib/types";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function BuscaPage() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    setArticles(publishedArticles());
    const load = () => setArticles(publishedArticles());
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return articles.filter((a) =>
      normalize(
        `${a.title} ${a.subtitle} ${a.editoria} ${a.tags.join(" ")}`,
      ).includes(q),
    );
  }, [query, articles]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">🔍 Buscar no portal</h1>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            window.history.replaceState(
              null,
              "",
              `/busca?q=${encodeURIComponent(query)}`,
            );
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o que procura: obra, time, negócio, bairro..."
            className="flex-1 rounded-full border border-neutral-300 bg-transparent px-5 py-3 text-base dark:border-neutral-700"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-6 py-3 font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)]"
          >
            Buscar
          </button>
        </form>

        {query.trim() && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {results.length === 0
              ? "Nenhuma matéria encontrada. Tente outra palavra."
              : `${results.length} ${results.length === 1 ? "matéria encontrada" : "matérias encontradas"}`}
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}

        <p className="mt-12 text-sm text-neutral-400">
          <Link href="/" className="hover:text-[var(--accent-strong)]">
            ← Voltar para a página inicial
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
