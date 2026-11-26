"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RichText } from "@/lib/rich";
import { useSettings } from "@/lib/settings";

export function InstPageView({ slug }: { slug: string }) {
  const router = useRouter();
  const settings = useSettings();
  const page = settings.pages?.find((p) => p.slug === slug);

  useEffect(() => {
    if (page) document.title = `${page.title} — ${settings.portalName}`;
  }, [page, settings.portalName]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {page ? (
          <article className="animate-fade-up">
            <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
              {page.title}
            </h1>
            <div className="mt-6 text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
              <RichText text={page.content} />
            </div>
          </article>
        ) : (
          <div className="py-16 text-center">
            <p className="font-display text-2xl font-bold">Página não encontrada</p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Ela pode ter sido removida nas configurações do portal.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-neutral-950"
            >
              Voltar para a home
            </button>
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
