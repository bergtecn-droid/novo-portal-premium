"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { publishedArticles } from "@/lib/store";
import type { Article } from "@/lib/types";

export default function TagPage({
  params,
}: {
  params: Promise<{ nome: string }>;
}) {
  const [nome, setNome] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    params.then((p) => setNome(decodeURIComponent(p.nome).toLowerCase()));
    const load = () => setArticles(publishedArticles());
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, [params]);

  const results = articles.filter((a) =>
    a.tags.some((t) => t.toLowerCase() === nome),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">#{nome || "..."}</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {results.length === 0
            ? "Nenhuma matéria com essa tag ainda."
            : `${results.length} ${results.length === 1 ? "matéria" : "matérias"}`}
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
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
