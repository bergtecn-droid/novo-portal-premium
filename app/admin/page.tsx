"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { fileToResizedDataUrl } from "@/lib/image";
import {
  DEFAULT_INST_LINKS,
  loadSettings,
  saveSettings,
  useSettings,
} from "@/lib/settings";
import type { PortalSettings } from "@/lib/settings";
import {
  checkCloudStatus,
  deleteArticleFromServer,
  formatDate,
  listArticles,
  listQuickActions,
  deleteArticle,
  upsertArticle,
  saveQuickActions,
  syncAllLocalToServer,
  syncArticleToServer,
  defaultQuickActions,
  exportBackup,
  parseBackup,
  restoreBackup,
} from "@/lib/store";
import {
  THEMES,
  loadThemeChoice,
  saveThemeChoice,
  themeById,
} from "@/lib/themes";
import type { Article, Status } from "@/lib/types";

const statusStyle: Record<Status, string> = {
  publicado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  revisao: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  rascunho:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

const statusLabel: Record<Status, string> = {
  publicado: "🟢 Publicado",
  revisao: "🔵 Em revisão",
  rascunho: "⚪ Rascunho",
};

const ICONS = ["📝", "🖼️", "🎬", "📊", "🗑️", "⚙️", "🌐", "👤", "📢", "🔖"];

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [actions, setActions] = useState(defaultQuickActions);
  const [adding, setAdding] = useState(false);
  const [newAction, setNewAction] = useState({ label: "", icon: "📝", href: "/" });
  const [backupMsg, setBackupMsg] = useState("");
  const [cloudActive, setCloudActive] = useState<boolean | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMsg, setCloudMsg] = useState("");
  const [themeChoice, setThemeChoice] = useState("auto");
  const fileRef = useRef<HTMLInputElement>(null);
  const settings = useSettings();
  const [settingsDraft, setSettingsDraft] = useState<PortalSettings | null>(null);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => setSettingsDraft(loadSettings());
    load();
    window.addEventListener("portal-nova.settings", load);
    return () => window.removeEventListener("portal-nova.settings", load);
  }, []);

  useEffect(() => {
    const load = () => {
      setArticles(listArticles());
      setActions(listQuickActions());
      setThemeChoice(loadThemeChoice());
    };
    load();
    window.addEventListener("portal-nova.update", load);
    return () => window.removeEventListener("portal-nova.update", load);
  }, []);

  useEffect(() => {
    checkCloudStatus().then(setCloudActive);
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

  const pickTheme = (id: string) => {
    setThemeChoice(id);
    saveThemeChoice(id);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0f1a30]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-display text-xl font-bold">
            {settings.portalName} <span className="text-[var(--accent-strong)]">• Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-500 transition hover:border-red-400 hover:text-red-500 dark:border-neutral-700"
            >
              Sair
            </button>
            <Link
              href="/admin/publicar"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)]"
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
            {
              label: "Visualizações",
              value: totalViews.toLocaleString("pt-BR"),
              icon: "👁️",
              tone: "text-fuchsia-500",
            },
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

        <section
          id="audiencia"
          className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]"
        >
          <h2 className="font-display text-lg font-bold">📈 Audiência por matéria</h2>
          <div className="mt-4 space-y-3">
            {publicadas.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="w-48 truncate text-sm text-neutral-600 dark:text-neutral-300">
                  {a.title}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-soft)] to-[var(--accent)]"
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
              className="rounded-full border border-neutral-300 px-3 py-1 text-sm font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
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
                const next = [...actions, { ...newAction, id: crypto.randomUUID() }];
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
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
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
              <button className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-bold text-neutral-950">
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
                <Link href={action.href} className="flex flex-1 items-center gap-3 font-medium">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-wash)] text-lg">
                    {action.icon}
                  </span>
                  <span className="text-sm">{action.label}</span>
                </Link>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => move(idx, -1)} className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700">
                    ↑
                  </button>
                  <button onClick={() => move(idx, 1)} className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700">
                    ↓
                  </button>
                  <button
                    onClick={() => remove(action.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">🎨 Tema do portal</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Muda a cor de todo o site. Escolha um fixo ou deixe o calendário
            mandar — aí o portal troca sozinho (ex: verde no Natal).
          </p>
          <div className="mt-4">
            <button
              onClick={() => pickTheme("auto")}
              className={`mr-2 mb-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                themeChoice === "auto"
                  ? "border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent-strong)]"
                  : "border-neutral-300 hover:border-[var(--accent)] dark:border-neutral-700"
              }`}
            >
              🗓️ Automático (calendário)
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => pickTheme(theme.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  themeChoice === theme.id
                    ? "border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent-strong)]"
                    : "border-neutral-300 hover:border-[var(--accent)] dark:border-neutral-700"
                }`}
              >
                {theme.emoji} {theme.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            Tema ativo: {themeById(themeChoice).emoji} {themeById(themeChoice).name}
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">⚙️ Configurações do portal</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Personalize o nome, a logomarca e as editorias do portal.
          </p>

          {settingsDraft && (
            <div className="mt-4 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm block">
                  <span className="font-semibold">Nome do portal</span>
                  <input
                    value={settingsDraft.portalName}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, portalName: e.target.value })
                    }
                    placeholder="Ex: Nova, Metrópole, Cidade em Foco"
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
                  />
                </label>
                <div className="text-sm">
                  <span className="font-semibold">Logomarca</span>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setLogoBusy(true);
                      try {
                        const dataUrl = await fileToResizedDataUrl(file, 512, 0.92);
                        setSettingsDraft({ ...settingsDraft, logoUrl: dataUrl });
                        setSettingsMsg("");
                      } catch {
                        setSettingsMsg("❌ Não foi possível carregar a logomarca.");
                      } finally {
                        setLogoBusy(false);
                      }
                    }}
                  />
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {settingsDraft.logoUrl && (
                      <img
                        src={settingsDraft.logoUrl}
                        alt=""
                        className="h-10 rounded-lg border border-neutral-200 bg-white object-contain p-1 dark:border-neutral-700"
                      />
                    )}
                    <button
                      onClick={() => logoRef.current?.click()}
                      className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
                    >
                      {logoBusy ? "Carregando…" : settingsDraft.logoUrl ? "🖼️ Trocar logomarca" : "📤 Enviar logomarca"}
                    </button>
                    {settingsDraft.logoUrl && (
                      <button
                        onClick={() => setSettingsDraft({ ...settingsDraft, logoUrl: undefined })}
                        className="rounded-full px-2 py-1 text-xs text-red-500 hover:underline"
                      >
                        remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Editorias (menu do portal)</span>
                  <button
                    onClick={() =>
                      setSettingsDraft({
                        ...settingsDraft,
                        editorias: [...settingsDraft.editorias, ""],
                      })
                    }
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
                  >
                    + Adicionar editoria
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {settingsDraft.editorias.map((editoria, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={editoria}
                        onChange={(e) => {
                          const next = [...settingsDraft.editorias];
                          next[i] = e.target.value;
                          setSettingsDraft({ ...settingsDraft, editorias: next });
                        }}
                        placeholder={`Editoria ${i + 1}`}
                        className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <button
                        onClick={() => {
                          if (i === 0) return;
                          const next = [...settingsDraft.editorias];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          setSettingsDraft({ ...settingsDraft, editorias: next });
                        }}
                        className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => {
                          if (i >= settingsDraft.editorias.length - 1) return;
                          const next = [...settingsDraft.editorias];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          setSettingsDraft({ ...settingsDraft, editorias: next });
                        }}
                        className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() =>
                          setSettingsDraft({
                            ...settingsDraft,
                            editorias: settingsDraft.editorias.filter((_, k) => k !== i),
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {settingsDraft.editorias.length === 0 && (
                    <p className="text-xs text-neutral-400">
                      O portal precisa de pelo menos uma editoria.
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-neutral-400">
                  Dica: ao renomear uma editoria, as matérias publicadas nela
                  acompanham o novo nome automaticamente.
                </p>
              </div>

              <div>
                <span className="text-sm font-semibold">Frase do rodapé</span>
                <textarea
                  value={settingsDraft.tagline ?? ""}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, tagline: e.target.value })
                  }
                  rows={2}
                  placeholder="Ex: Jornalismo local com clareza e rapidez."
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Links do rodapé (Institucional)
                  </span>
                  <button
                    onClick={() =>
                      setSettingsDraft({
                        ...settingsDraft,
                        instLinks: [
                          ...(settingsDraft.instLinks ?? DEFAULT_INST_LINKS),
                          { label: "" },
                        ],
                      })
                    }
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
                  >
                    + Adicionar item
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {(settingsDraft.instLinks ?? []).map((l, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <input
                        value={l.label}
                        onChange={(e) => {
                          const next = [...(settingsDraft.instLinks ?? [])];
                          next[i] = { ...next[i], label: e.target.value };
                          setSettingsDraft({ ...settingsDraft, instLinks: next });
                        }}
                        placeholder="Texto (ex: Quem somos)"
                        className="w-48 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <input
                        value={l.url ?? ""}
                        onChange={(e) => {
                          const next = [...(settingsDraft.instLinks ?? [])];
                          next[i] = { ...next[i], url: e.target.value };
                          setSettingsDraft({ ...settingsDraft, instLinks: next });
                        }}
                        placeholder="Endereço (pode ficar vazio)"
                        className="w-48 flex-[2] rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <button
                        onClick={() => {
                          const next = [...(settingsDraft.instLinks ?? [])];
                          if (i === 0) return;
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          setSettingsDraft({ ...settingsDraft, instLinks: next });
                        }}
                        className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => {
                          const next = [...(settingsDraft.instLinks ?? [])];
                          if (i >= next.length - 1) return;
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          setSettingsDraft({ ...settingsDraft, instLinks: next });
                        }}
                        className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() =>
                          setSettingsDraft({
                            ...settingsDraft,
                            instLinks: (settingsDraft.instLinks ?? []).filter(
                              (_, k) => k !== i,
                            ),
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-neutral-400">
                    Dica: se deixar o endereço vazio, o nome aparece no rodapé
                    sem link.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const current = loadSettings();
                    saveSettings({
                      portalName: settingsDraft.portalName,
                      logoUrl: settingsDraft.logoUrl,
                      editorias: settingsDraft.editorias,
                      tagline: settingsDraft.tagline,
                      instLinks: settingsDraft.instLinks,
                    });
                    current.editorias.forEach((oldName, i) => {
                      const newName = settingsDraft.editorias[i];
                      if (newName && newName.trim() !== oldName) {
                        listArticles().forEach((a) => {
                          if (a.editoria === oldName) {
                            upsertArticle({ ...a, editoria: newName.trim() });
                          }
                        });
                      }
                    });
                    setSettingsDraft(loadSettings());
                    setArticles(listArticles());
                    setSettingsMsg("✅ Configurações salvas! O portal já está atualizado.");
                  }}
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)]"
                >
                  💾 Salvar configurações
                </button>
                {settingsMsg && (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{settingsMsg}</span>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">☁️ Nuvem &amp; compartilhamento</h2>
          {cloudActive === null ? (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Verificando a nuvem...
            </p>
          ) : cloudActive ? (
            <>
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                ✅ Nuvem ativa! Suas matérias publicadas ficam salvas no servidor
                e o compartilhamento no WhatsApp mostra a foto e o título.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    setCloudBusy(true);
                    setCloudMsg("");
                    const { total, ok } = await syncAllLocalToServer();
                    setCloudBusy(false);
                    setCloudMsg(
                      ok === total
                        ? `✅ ${ok} de ${total} matérias enviadas para a nuvem. O compartilhamento já mostra a foto!`
                        : `⚠️ ${ok} de ${total} enviadas. Tente novamente para as que faltaram.`,
                    );
                  }}
                  disabled={cloudBusy}
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
                >
                  {cloudBusy
                    ? "⏳ Enviando..."
                    : "🚀 Enviar todas as matérias para a nuvem"}
                </button>
                {cloudMsg && (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {cloudMsg}
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              ⚠️ A nuvem ainda <strong>não está ativa</strong>. Enquanto isso, as
              matérias ficam salvas só neste aparelho e o WhatsApp não consegue
              mostrar a foto. Ative no painel da Vercel: <strong>Storage → Create
              Database → Blob → Connect → Redeploy</strong> (guia completo no
              README). Depois, volte aqui e clique em “Enviar todas as matérias
              para a nuvem”.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">💾 Backup do portal</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Baixe uma cópia de segurança com todas as matérias e ações rápidas.
            Guarde o arquivo — se algo der problema, restaure em segundos.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const blob = new Blob([exportBackup()], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `backup-portal-nova-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setBackupMsg("✅ Backup baixado. Guarde o arquivo em local seguro.");
              }}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)]"
            >
              ⬇️ Baixar backup
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
            >
              ⬆️ Restaurar backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const text = await file.text();
                const data = parseBackup(text);
                if (!data) {
                  setBackupMsg("❌ Arquivo inválido. Use um backup gerado por este portal.");
                  return;
                }
                const ok = window.confirm(
                  `Restaurar backup com ${data.articles.length} matérias? Isso substitui tudo o que está no portal agora.`,
                );
                if (!ok) return;
                restoreBackup(data);
                setArticles(listArticles());
                setActions(listQuickActions());
                setBackupMsg(`✅ Backup restaurado: ${data.articles.length} matérias recarregadas.`);
              }}
            />
          </div>
          {backupMsg && (
            <p className="mt-3 rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800/60">
              {backupMsg}
            </p>
          )}
        </section>

        <section
          id="materias"
          className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]"
        >
          <h2 className="font-display text-lg font-bold">📋 Todas as matérias</h2>
          <div className="mt-4">
            {articles.map((a) => (
              <div
                key={a.id}
                className="group flex flex-wrap items-center gap-3 border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-800/60"
              >
                <img src={a.cover} alt="" className="h-12 w-20 rounded-lg object-cover" />
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
                      onClick={async () => {
                        const published = {
                          ...a,
                          status: "publicado" as const,
                          publishedAt: new Date().toISOString(),
                        };
                        upsertArticle(published);
                        await deleteArticleFromServer(a.slug);
                        await syncArticleToServer(published);
                        setArticles(listArticles());
                      }}
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
                    onClick={async () => {
                      deleteArticle(a.id);
                      await deleteArticleFromServer(a.slug);
                      setArticles(listArticles());
                    }}
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
