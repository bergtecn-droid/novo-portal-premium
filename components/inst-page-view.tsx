"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RichText } from "@/lib/rich";
import { useSettings } from "@/lib/settings";

export function InstPageView({ slug }: { slug: string }) {
  const router = useRouter();
  const settings = useSettings();
  const page = settings.pages?.find((p) => p.slug === slug);
  const [leadName, setLeadName] = useState("");
  const [leadBiz, setLeadBiz] = useState("");
  const [leadMsg, setLeadMsg] = useState("");

  const waNumber = (settings.contactWhatsapp ?? "").replace(/\D/g, "");
  const showLeadForm =
    (slug === "anuncie-aqui" || slug === "fale-com-a-redacao") &&
    waNumber.length >= 10;

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

            {showLeadForm && (
              <form
                className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#0f1a30]"
                onSubmit={(e) => {
                  e.preventDefault();
                  const text =
                    slug === "anuncie-aqui"
                      ? `Olá! Quero anunciar no ${settings.portalName}.\n\n*Nome:* ${leadName}\n*Negócio:* ${leadBiz}\n*Mensagem:* ${leadMsg}`
                      : `Olá! Sou ${leadName}.\n\n${leadMsg}`;
                  window.open(
                    `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`,
                    "_blank",
                  );
                }}
              >
                <h2 className="font-display text-lg font-bold">
                  {slug === "anuncie-aqui"
                    ? "📣 Quero anunciar meu negócio"
                    : "✉️ Envie sua mensagem"}
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Preencha e envie — a mensagem chega direto no WhatsApp da
                  equipe.
                </p>
                <div className="mt-4 space-y-3">
                  <input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                  />
                  {slug === "anuncie-aqui" && (
                    <input
                      value={leadBiz}
                      onChange={(e) => setLeadBiz(e.target.value)}
                      placeholder="Nome do seu negócio (loja, empresa, serviço)"
                      className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                    />
                  )}
                  <textarea
                    value={leadMsg}
                    onChange={(e) => setLeadMsg(e.target.value)}
                    rows={3}
                    placeholder={
                      slug === "anuncie-aqui"
                        ? "Mensagem (ex: quero um banner na página inicial)"
                        : "Sua mensagem"
                    }
                    required
                    className="w-full resize-y rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)]"
                >
                  💬 Enviar pelo WhatsApp
                </button>
              </form>
            )}
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
