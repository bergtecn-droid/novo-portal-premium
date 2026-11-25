"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDate, listArticles, listQuickActions, deleteArticle, upsertArticle, saveQuickActions, defaultQuickActions } from "@/lib/store";
import type { Article, Status } from "@/lib/types";

const statusStyle: Record<Status, string> = {
  publicado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  revisao: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  rascunho: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

const statusLabel: Record<Status, string> = {
  publicado: "🟢 Publicado",
  revisao: "🔵 Em revisão",
  rascunho: "🟡 Rascunho",
};

const ICONS = ["📝", "🖼️", "🎬", "📊", "🗑️", "⚙️", "🌐", "👤", "📢", "🔖"];

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [actions, setActions] = useState(defaultQuickActions);
  const [adding, setAdding] = useState(false);
  const [newAction, setNewAction] = useState({ label: "", icon: "📝", href: "/" });

  useEffect(() => {
    const load = () => {
      setArticles(listArticles());
      setActions(listQuickActions());
    };
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, []);

  const publicadas = articles.filter((a) => a.status === "publicado");
  const rascunhos = articles.filter((a) => a.status === "rascunho");
  const revisao = articles.filter((a) => a.status === "revisao");
  const totalViews = publicadas.reduce((sum, a) => sum + a.views, 0);
  const maxViews = Math.max(1, ...publicadas.map((a) => a.views));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...actions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setActions(next);
    saveQuickActions(next);
  };

  const remove = (id: string) => {
    const next = actions.filter((a) => a.id !== id);
    setActions(next);
    saveQuickActions(next);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0f1a30]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl font-bold">
              Nova <span className="text-amber-500">• Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/publicar"
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-amber-400"
            >
              + Publicar matéria
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <section>
          <h1 className="font-display text-2xl font-bold">Bom dia, editor 👋</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Aqui está o resumo do portal hoje.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Publicadas", value: publicadas.length, icon: "📰", tone: "text-emerald-500" },
            { label: "Rascunhos", value: rascunhos.length, icon: "📝", tone: "text-amber-500" },
            { label: "Em revisão", value: revisao.length, icon: "🔍", tone: "text-sky-500" },
            { label: "Visualizações", value: totalViews.toLocaleString("pt-BR"), icon: "👁️", tone: "text-fuchsia-500" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-[#0f1a30]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </span>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className={`font-display mt-2 text-3xl font-bold ${card.tone}`}>
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section id="audiencia" className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">📈 Audiência por matéria</h2>
          <div className="mt-4 space-y-3">
            {publicadas.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="w-48 truncate text-sm text-neutral-600 dark:text-neutral-300">
                  {a.title}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${(a.views / maxViews) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-semibold text-neutral-500">
                  {a.views.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
            {publicadas.length === 0 && (
              <p className="text-sm text-neutral-500">Sem dados ainda.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">⚡ Ações rápidas</h2>
            <button
              onClick={() => setAdding(!adding)}
              className="rounded-full border border-neutral-300 px-3 py-1 text-sm font-semibold transition hover:border-amber-500 dark:border-neutral-700"
            >
              {adding ? "Fechar" : "+ Adicionar botão"}
            </button>
          </div>

          {adding && (
            <form
              className="mt-4 flex flex-wrap gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAction.label.trim()) return;
                const next = [
                  ...actions,
                  { ...newAction, id: crypto.randomUUID() },
                ];
                setActions(next);
                saveQuickActions(next);
                setNewAction({ label: "", icon: "📝", href: "/" });
                setAdding(false);
              }}
            >
              <select
                value={newAction.icon}
                onChange={(e) => setNewAction({ ...newAction, icon: e.target.value })}
                className="rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
              >
                {ICONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
              <input
                placeholder="Nome do botão"
                value={newAction.label}
                onChange={(e) => setNewAction({ ...newAction, label: e.target.value })}
                className="min-w-40 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
              />
              <input
                placeholder="Link (ex: /admin/publicar)"
                value={newAction.href}
                onChange={(e) => setNewAction({ ...newAction, href: e.target.value })}
                className="min-w-40 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
              />
              <button className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-bold text-neutral-950">
                Salvar
              </button>
            </form>
          )}

          <div className="mt-4">
            {actions.map((action, idx) => (
              <div
                key={action.id}
                className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/40"
              >
                <Link
                  href={action.href}
                  className="flex flex-1 items-center gap-3 font-medium"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-900/40">
                    {action.icon}
                  </span>
                  <span className="text-sm">{action.label}</span>
                </Link>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => move(idx, -1)} className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700">↑</button>
                  <button onClick={() => move(idx, 1)} className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700">↓</button>
                  <button onClick={() => remove(action.id)} className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="materias" className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">📋 Todas as matérias</h2>
          <div className="mt-4">
            {articles.map((a) => (
              <div
                key={a.id}
                className="group flex flex-wrap items-center gap-3 border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-800/60"
              >
                <img
                  src={a.cover}
                  alt=""
                  className="h-12 w-20 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-neutral-400">
                    {a.editoria} • {formatDate(a.publishedAt)} •{" "}
                    {a.views.toLocaleString("pt-BR")} views
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[a.status]}`}>
                  {statusLabel[a.status]}
                </span>
                <div className="flex gap-1">
                  {a.status !== "publicado" && (
                    <button
                      onClick={() =>
                        upsertArticle({ ...a, status: "publicado", publishedAt: new Date().toISOString() })
                      }
                      className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400"
                    >
                      Publicar
                    </button>
                  )}
                  <Link
                    href={`/admin/publicar?slug=${a.slug}`}
                    className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-400"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteArticle(a.id)}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
