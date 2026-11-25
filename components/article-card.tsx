"use client";

import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/store";

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: Article;
  variant?: "hero" | "default" | "compact";
}) {
  if (variant === "hero") {
    return (
      <Link
        href={`/materia/${article.slug}`}
        className="group relative block overflow-hidden rounded-2xl shadow-lg"
      >
        <img
          src={article.cover}
          alt={article.title}
          className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute bottom-0 p-6 text-white md:p-8">
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-950">
            {article.editoria}
          </span>
          <h2 className="font-display mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
            {article.title}
          </h2>
          <p className="mt-2 max-w-2xl text-neutral-200">{article.subtitle}</p>
          <p className="mt-3 text-sm text-neutral-400">
            {article.author} • {formatDate(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/materia/${article.slug}`}
        className="group flex gap-3 rounded-xl p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <img
          src={article.cover}
          alt={article.title}
          className="h-16 w-24 shrink-0 rounded-lg object-cover"
        />
        <div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400">
            {article.title}
          </h4>
          <p className="mt-1 text-xs text-neutral-400">
            {formatDate(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/materia/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-[#0f1a30]"
    >
      <div className="overflow-hidden">
        <img
          src={article.cover}
          alt={article.title}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          {article.editoria}
        </span>
        <h3 className="font-display mt-1.5 text-lg font-bold leading-snug group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {article.subtitle}
        </p>
        <p className="mt-auto pt-3 text-xs text-neutral-400">
          {article.author} • {formatDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
