"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { BannerStrip } from "@/components/banners";
import { useSettings } from "@/lib/settings";
import { usePublishedArticles } from "@/lib/store";
import type { Article } from "@/lib/types";

export default function HomePage() {
  const settings = useSettings();
  const articles = usePublishedArticles();

  const [hero, ...rest] = articles;
  const secondary = rest.slice(0, 3);
  const others = rest.slice(3);
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {hero ? (
          <section className="animate-fade-up">
            <ArticleCard article={hero} variant="hero" />
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <p className="font-display text-2xl font-bold">
              Nenhuma matéria publicada ainda
            </p>
            <p className="mt-2 text-neutral-500">
              Acesse o painel administrativo e publique sua primeira matéria.
            </p>
            <Link
              href="/admin/publicar"
              className="mt-4 inline-block rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-neutral-950"
            >
              Publicar matéria
            </Link>
          </section>
        )}

        <BannerStrip position="topo" />

        {secondary.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display flex items-center gap-3 text-xl font-bold">
              Em destaque
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            {others.length > 0 && (
              <section>
                <h2 className="font-display flex items-center gap-3 text-xl font-bold">
                  Últimas notícias
                  <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {others.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {settings.editorias.slice(0, 4).map((editoria) => {
              const list = articles.filter((a) => a.editoria === editoria);
              if (list.length === 0) return null;
              return (
                <section key={editoria} className="mt-12">
                  <h2 className="font-display flex items-center gap-3 text-xl font-bold">
                    <Link
                      href={`/editoria/${encodeURIComponent(editoria.toLowerCase())}`}
                      className="border-l-4 border-[var(--accent)] pl-3 hover:text-[var(--accent-strong)]"
                    >
                      {editoria}
                    </Link>
                    <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                  </h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    {list.slice(0, 3).map((a) => (
                      <ArticleCard key={a.id} article={a} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="space-y-8">
            <BannerStrip position="lateral" />

            <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0f1a30]">
              <h3 className="font-display text-lg font-bold">
                📈 Mais lidas da semana
              </h3>
              <div className="mt-4">
                {mostRead.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="compact" />
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] p-6 text-neutral-950">
              <h3 className="font-display text-xl font-bold">Anuncie aqui</h3>
              <p className="mt-2 text-sm font-medium">
                Seu negócio visto por milhares de leitores todos os dias.
              </p>
              <Link
                href="/p/anuncie-aqui"
                className="mt-4 inline-block rounded-full bg-neutral-950 px-5 py-2 text-sm font-bold text-[var(--accent-strong)] transition hover:bg-neutral-800"
              >
                Quero anunciar
              </Link>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
              <h3 className="font-display text-lg font-bold">
                📬 Receba as novidades
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                As principais notícias do dia no seu e-mail.
              </p>
              <input
                type="email"
                placeholder="seu@email.com"
                className="mt-3 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              />
              <button className="mt-2 w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-[var(--accent-strong)] dark:bg-[var(--accent)] dark:text-neutral-950">
                Inscrever
              </button>
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
