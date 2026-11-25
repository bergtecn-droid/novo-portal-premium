"use client";

import { NextPage } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { MediaRenderer } from "@/components/media-render";
import { getArticle, formatDate, publishedArticles, readingTime } from "@/lib/store";
import type { Article } from "@/lib/types";

const ArticlePage: NextPage = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(getArticle(params.slug) ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = () => {
      const found = getArticle(params.slug);
      if (!found || found.status !== "publicado") {
        setArticle(null);
        return;
      }
      setArticle(found);
    };
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, [params.slug]);

  useEffect(() => {
    if (article) document.title = `${article.title} — Portal Nova`;
  }, [article]);

  const related = article
    ? publishedArticles()
        .filter(
          (a) => a.id !== article.id && a.editoria === article.editoria,
        )
        .slice(0, 3)
    : [];

  const share = async () => {
    if (!article) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
        return;
      } catch {
        /* fallback */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!article) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="font-display text-3xl font-bold">
            Matéria não encontrada
          </p>
          <p className="mt-3 text-neutral-500">
            Ela pode ter sido removida ou ainda não foi publicada.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-full bg-amber-500 px-6 py-2.5 font-semibold text-neutral-950"
          >
            Voltar para a home
          </button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <nav className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-amber-600">
            Início
          </Link>{" "}
          /{" "}
          <Link
            href={`/editoria/${encodeURIComponent(article.editoria.toLowerCase())}`}
            className="font-semibold text-amber-600 dark:text-amber-400"
          >
            {article.editoria}
          </Link>
        </nav>

        <article className="animate-fade-up">
          <header>
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-950">
              {article.editoria}
            </span>
            <h1 className="font-display mt-4 text-3xl font-bold leading-tight md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 md:text-xl">
              {article.subtitle}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-neutral-200 py-3 text-sm text-neutral-500 dark:border-neutral-800">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {article.author}
              </span>
              <span>{formatDate(article.publishedAt)}</span>
              <span>⏱ {readingTime(article)} min de leitura</span>
              <span className="ml-auto flex gap-2">
                <button
                  onClick={share}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:border-amber-500 dark:border-neutral-700"
                >
                  {copied ? "Link copiado ✓" : "↗ Compartilhar"}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:border-amber-500 dark:border-neutral-700"
                >
                  WhatsApp
                </a>
              </span>
            </div>
          </header>

          {article.cover && (
            <figure className="mt-6">
              <img
                src={article.cover}
                alt={article.title}
                className="w-full rounded-2xl shadow-lg"
              />
              {article.coverCaption && (
                <figcaption className="mt-2 border-l-2 border-amber-500 pl-3 text-sm italic text-neutral-500 dark:text-neutral-400">
                  {article.coverCaption}
                </figcaption>
              )}
            </figure>
          )}

          <div className="prose mt-8">
            <MediaRenderer blocks={article.blocks} />
          </div>

          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display flex items-center gap-3 text-xl font-bold">
              Matérias relacionadas
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default ArticlePage;
