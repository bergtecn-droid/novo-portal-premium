"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { publishedArticles } from "@/lib/store";
import type { Article } from "@/lib/types";
import { EDITORIAS } from "@/lib/seed";

export default function EditoriaPage() {
  const params = useParams<{ nome: string }>();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const load = () => setArticles(publishedArticles());
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, []);

  const nome = decodeURIComponent(params.nome || "");
  const titulo =
    EDITORIAS.find((e) => e.toLowerCase() === nome.toLowerCase()) ?? nome;
  const list = articles.filter(
    (a) => a.editoria.toLowerCase() === nome.toLowerCase(),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display border-l-4 border-amber-500 pl-4 text-3xl font-bold md:text-4xl">
          {titulo}
        </h1>
        <p className="mt-2 pl-5 text-neutral-500 dark:text-neutral-400">
          {list.length} matéria{list.length === 1 ? "" : "s"} publicada
          {list.length === 1 ? "" : "s"}
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="mt-16 text-center text-neutral-500">
            Ainda não há matérias nesta editoria.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
