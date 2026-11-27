"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { fileToResizedDataUrl } from "@/lib/image";
import type { Banner } from "@/lib/settings";
import {
  DEFAULT_INST_LINKS,
  loadSettings,
  saveSettings,
  setSiteLock,
  useSettings,
} from "@/lib/settings";
import {
  DEFAULT_RADIO_STATIONS,
  loadRadio,
  saveRadio,
} from "@/lib/radio";
import type { RadioConfig } from "@/lib/radio";
import type { PortalSettings } from "@/lib/settings";
import {
  checkAdminStatus,
  checkCloudStatus,
  deleteArticleFromServer,
  displayViews,
  formatDate,
  listArticles,
  listQuickActions,
  deleteArticle,
  upsertArticle,
  saveQuickActions,
  syncAllLocalToServer,
  syncArticleToServer,
  useAllArticles,
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
  const { articles, refresh } = useAllArticles();
  const [actions, setActions] = useState(defaultQuickActions);
  const [adding, setAdding] = useState(false);
  const [newAction, setNewAction] = useState({ label: "", icon: "📝", href: "/" });
  const [backupMsg, setBackupMsg] = useState("");
  const [cloudActive, setCloudActive] = useState<boolean | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMsg, setCloudMsg] = useState("");
  const [radioDraft, setRadioDraft] = useState<RadioConfig | null>(null);
  const [radioMsg, setRadioMsg] = useState("");
  const bannerPhotoRef = useRef<HTMLInputElement>(null);
  const [bannerPhotoIdx, setBannerPhotoIdx] = useState<number | null>(null);
  const [themeChoice, setThemeChoice] = useState("auto");
  const fileRef = useRef<HTMLInputElement>(null);
  const settings = useSettings();
  const [settingsDraft, setSettingsDraft] = useState<PortalSettings | null>(null);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const [lockState, setLockState] = useState<{
    storage: boolean | null;
    locked: boolean | null;
  } | null>(null);
  const [lockBusy, setLockBusy] = useState(false);
  const [lockMsg, setLockMsg] = useState("");
  const [lockPassword, setLockPassword] = useState("");

  useEffect(() => {
    const load = () => setSettingsDraft(loadSettings());
    load();
    window.addEventListener("portal-nova.settings", load);
    return () => window.removeEventListener("portal-nova.settings", load);
  }, []);

  useEffect(() => {
    const load = () => {
      refresh();
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

  useEffect(() => {
    checkAdminStatus().then(setLockState);
  }, []);

  useEffect(() => {
    const load = () => setRadioDraft(loadRadio());
    load();
    window.addEventListener("portal-nova.radio", load);
    return () => window.removeEventListener("portal-nova.radio", load);
  }, []);

  const refreshLock = () => {
    checkAdminStatus().then(setLockState);
    setSettingsDraft(loadSettings());
  };

  const applyLock = async (locked: boolean, password?: string) => {
    if (lockBusy) return;
    setLockBusy(true);
    setLockMsg("");
    try {
      await setSiteLock(locked, password);
      setLockPassword("");
      refreshLock();
      setLockMsg(
        locked
          ? cloudActive
            ? "🔒 Portal bloqueado! Só entra quem tiver a senha de acesso."
            : "🔒 Bloqueio salvo! Vai valer para todos os visitantes assim que a nuvem estiver ativa (guia na seção ☁️ Nuvem abaixo)."
          : "🟢 Portal desbloqueado — aberto para todo mundo.",
      );
    } catch {
      setLockMsg("❌ Não foi possível salvar o bloqueio. Tente de novo.");
    } finally {
      setLockBusy(false);
    }
  };

  const lockNow = () => {
    const pw = lockPassword.trim();
    if (pw.length < 4) {
      setLockMsg("❌ A senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    applyLock(true, pw);
  };

  const publicadas = articles.filter((a) => a.status === "publicado");
  const rascunhos = articles.filter((a) => a.status === "rascunho");
  const revisao = articles.filter((a) => a.status === "revisao");
  const totalViews = publicadas.reduce((sum, a) => sum + displayViews(a), 0);
  const maxViews = Math.max(1, ...publicadas.map(displayViews));

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
                  {displayViews(a).toLocaleString("pt-BR")}
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
                <label className="text-sm block">
                  <span className="font-semibold">
                    WhatsApp de contato (anunciantes e redação)
                  </span>
                  <input
                    value={settingsDraft.contactWhatsapp ?? ""}
                    onChange={(e) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        contactWhatsapp: e.target.value,
                      })
                    }
                    placeholder="Ex: (91) 99999-9999"
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
                  />
                </label>
                <p className="mt-1 text-xs text-neutral-400">
                  Com esse número, o formulário “Quero anunciar” envia as
                  mensagens dos anunciantes direto para o WhatsApp do cliente.
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
                    sem link. Endereços prontos das páginas:
                    /p/quem-somos, /p/anuncie-aqui, /p/fale-com-a-redacao.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold">
                  Páginas institucionais (texto de cada página)
                </span>
                <div className="mt-2 space-y-4">
                  {(settingsDraft.pages ?? []).map((p, i) => (
                    <div
                      key={p.slug || i}
                      className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                    >
                      <input
                        value={p.title}
                        onChange={(e) => {
                          const next = [...(settingsDraft.pages ?? [])];
                          next[i] = { ...next[i], title: e.target.value };
                          setSettingsDraft({ ...settingsDraft, pages: next });
                        }}
                        placeholder="Título da página"
                        className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm font-bold dark:border-neutral-700"
                      />
                      <textarea
                        value={p.content}
                        onChange={(e) => {
                          const next = [...(settingsDraft.pages ?? [])];
                          next[i] = { ...next[i], content: e.target.value };
                          setSettingsDraft({ ...settingsDraft, pages: next });
                        }}
                        rows={5}
                        placeholder="Texto da página..."
                        className="mt-2 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <p className="mt-1 text-[11px] text-neutral-400">
                        Página: /p/{p.slug} • Dá para usar **negrito**, listas
                        com “- ” e parágrafos (linha vazia).
                      </p>
                    </div>
                  ))}
                  <p className="text-xs text-neutral-400">
                    Esses textos aparecem quando o visitante clica nos links do
                    rodapé (Quem somos, Anuncie aqui, Fale com a redação).
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
                      pages: settingsDraft.pages,
                      banners: settingsDraft.banners,
                      contactWhatsapp: settingsDraft.contactWhatsapp,
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
                    refresh();
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
          <h2 className="font-display text-lg font-bold">🔒 Bloqueio do portal</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Tranca o site inteiro: o visitante só vê as matérias depois de digitar
            a senha de acesso. O painel <b>/admin</b> continua sempre acessível
            com a senha do administrador.
          </p>

          {(() => {
            const isLocked = lockState?.locked ?? settingsDraft?.siteLocked === true;
            return (
              <div className="mt-4 space-y-4">
                <div
                  className={`rounded-xl border p-4 text-sm font-semibold ${
                    isLocked
                      ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                  }`}
                >
                  {isLocked
                    ? "🔒 O portal está BLOQUEADO — somente quem tem a senha de acesso consegue ver as matérias."
                    : "🟢 O portal está aberto — qualquer pessoa com o link consegue ver."}
                </div>

                {isLocked ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="password"
                      value={lockPassword}
                      onChange={(e) => setLockPassword(e.target.value)}
                      placeholder="Nova senha de acesso (opcional)"
                      className="w-full max-w-xs rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
                    />
                    <button
                      onClick={lockNow}
                      disabled={lockBusy || !lockPassword.trim()}
                      className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] disabled:opacity-50 dark:border-neutral-700"
                    >
                      🔑 Trocar senha
                    </button>
                    <button
                      onClick={() => applyLock(false)}
                      disabled={lockBusy}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      🟢 Desbloquear o portal
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="password"
                      value={lockPassword}
                      onChange={(e) => setLockPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") lockNow();
                      }}
                      placeholder="Crie a senha de acesso ao portal"
                      className="w-full max-w-xs rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
                    />
                    <button
                      onClick={lockNow}
                      disabled={lockBusy || !lockPassword.trim()}
                      className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
                    >
                      {lockBusy ? "Salvando…" : "🔒 Bloquear o portal"}
                    </button>
                  </div>
                )}

                {cloudActive === false && isLocked && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    ⚠️ <b>A nuvem ainda não está ativa.</b> O bloqueio está salvo,
                    mas só vai valer para todos os visitantes depois de ativar a
                    nuvem — siga o guia na seção ☁️ Nuvem &amp; compartilhamento
                    abaixo.
                  </div>
                )}

                {lockMsg && (
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    {lockMsg}
                  </p>
                )}

                <p className="text-xs text-neutral-400">
                  Esqueceu a senha? Sem problema: volte aqui no painel e crie
                  outra (ou desbloqueie o portal).
                </p>
              </div>
            );
          })()}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">📣 Banners e anúncios</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Suba a foto do banner do cliente e o link do site/WhatsApp dele. O
            banner aparece no portal na posição escolhida.
          </p>
          {settingsDraft && (
            <div className="mt-4 space-y-3">
              {(settingsDraft.banners ?? []).map((b, i) => (
                <div key={b.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="flex flex-wrap items-start gap-3">
                    <img src={b.imageUrl} alt="" className="h-16 w-28 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700" />
                    <div className="min-w-[200px] flex-1 space-y-2">
                      <input
                        value={b.title}
                        onChange={(e) => {
                          const next = [...(settingsDraft.banners ?? [])];
                          next[i] = { ...next[i], title: e.target.value };
                          setSettingsDraft({ ...settingsDraft, banners: next });
                        }}
                        placeholder="Nome do anunciante (ex: Loja do João)"
                        className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <input
                        value={b.linkUrl ?? ""}
                        onChange={(e) => {
                          const next = [...(settingsDraft.banners ?? [])];
                          next[i] = { ...next[i], linkUrl: e.target.value };
                          setSettingsDraft({ ...settingsDraft, banners: next });
                        }}
                        placeholder="Link do cliente ao clicar no banner (pode ficar vazio)"
                        className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={b.position}
                          onChange={(e) => {
                            const next = [...(settingsDraft.banners ?? [])];
                            next[i] = { ...next[i], position: e.target.value as Banner["position"] };
                            setSettingsDraft({ ...settingsDraft, banners: next });
                          }}
                          className="rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-xs dark:border-neutral-700"
                        >
                          <option value="topo">Topo da home</option>
                          <option value="lateral">Lateral da home</option>
                          <option value="materia">Dentro da matéria</option>
                        </select>
                        <button
                          onClick={() => {
                            setBannerPhotoIdx(i);
                            bannerPhotoRef.current?.click();
                          }}
                          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
                        >
                          📷 Trocar foto
                        </button>
                        <label className="flex items-center gap-1.5 text-xs font-semibold">
                          <input
                            type="checkbox"
                            checked={b.active}
                            onChange={(e) => {
                              const next = [...(settingsDraft.banners ?? [])];
                              next[i] = { ...next[i], active: e.target.checked };
                              setSettingsDraft({ ...settingsDraft, banners: next });
                            }}
                            className="h-3.5 w-3.5 accent-[var(--accent)]"
                          />
                          Ativo
                        </label>
                        <button
                          onClick={() =>
                            setSettingsDraft({
                              ...settingsDraft,
                              banners: (settingsDraft.banners ?? []).filter((_, k) => k !== i),
                            })
                          }
                          className="ml-auto rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          ✕ Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setBannerPhotoIdx(null);
                    bannerPhotoRef.current?.click();
                  }}
                  className="rounded-full border border-dashed border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-500 transition hover:border-[var(--accent)] dark:border-neutral-600"
                >
                  📤 Adicionar banner (enviar foto do computador)
                </button>
                <span className="text-xs text-neutral-400">
                  Recomendado: foto larga e horizontal (ex: 1200 × 300).
                </span>
              </div>
              <input
                ref={bannerPhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    const dataUrl = await fileToResizedDataUrl(file, 1400, 0.82);
                    const next = [...(settingsDraft.banners ?? [])];
                    if (bannerPhotoIdx === null) {
                      next.push({
                        id: crypto.randomUUID(),
                        title: "",
                        imageUrl: dataUrl,
                        active: true,
                        position: "topo" as const,
                      });
                    } else {
                      next[bannerPhotoIdx] = {
                        ...next[bannerPhotoIdx],
                        imageUrl: dataUrl,
                      };
                    }
                    setBannerPhotoIdx(null);
                    setSettingsDraft({ ...settingsDraft, banners: next });
                  } catch {
                    setSettingsMsg("❌ Não foi possível carregar a foto do banner.");
                  }
                }}
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#0f1a30]">
          <h2 className="font-display text-lg font-bold">📻 Rádio ao vivo</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Coloque o streaming da rádio do cliente. O player aparece no canto
            inferior do portal, em todas as páginas. Use o endereço do streaming
            (começa com http).
          </p>
          {radioDraft && (
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={radioDraft.enabled}
                  onChange={(e) =>
                    setRadioDraft({ ...radioDraft, enabled: e.target.checked })
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span className="font-semibold">
                  Rádio ligada (mostra o player no portal)
                </span>
              </label>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Estações</span>
                  <button
                    onClick={() =>
                      setRadioDraft({
                        ...radioDraft,
                        stations: [...radioDraft.stations, { name: "", url: "" }],
                      })
                    }
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold transition hover:border-[var(--accent)] dark:border-neutral-700"
                  >
                    + Adicionar estação
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {radioDraft.stations.map((s, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <input
                        value={s.name}
                        onChange={(e) => {
                          const next = [...radioDraft.stations];
                          next[i] = { ...next[i], name: e.target.value };
                          setRadioDraft({ ...radioDraft, stations: next });
                        }}
                        placeholder="Nome (ex: Rádio Cidade FM)"
                        className="w-44 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <input
                        value={s.url}
                        onChange={(e) => {
                          const next = [...radioDraft.stations];
                          next[i] = { ...next[i], url: e.target.value };
                          setRadioDraft({ ...radioDraft, stations: next });
                        }}
                        placeholder="Endereço do streaming (http...)"
                        className="w-48 flex-[2] rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                      />
                      <button
                        onClick={() => {
                          const next = [...radioDraft.stations];
                          if (i === 0) return;
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          setRadioDraft({ ...radioDraft, stations: next });
                        }}
                        className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => {
                          const next = [...radioDraft.stations];
                          if (i >= next.length - 1) return;
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          setRadioDraft({ ...radioDraft, stations: next });
                        }}
                        className="rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() =>
                          setRadioDraft({
                            ...radioDraft,
                            stations: radioDraft.stations.filter((_, k) => k !== i),
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {radioDraft.stations.length === 0 && (
                    <p className="text-xs text-neutral-400">
                      Sem estações, o player não aparece. Use as demo ou adicione
                      a do cliente.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    saveRadio({
                      enabled: radioDraft.enabled,
                      stations:
                        radioDraft.stations.length > 0
                          ? radioDraft.stations
                          : DEFAULT_RADIO_STATIONS,
                    });
                    setRadioDraft(loadRadio());
                    setRadioMsg(
                      "✅ Rádio atualizada! O player do portal já está valendo.",
                    );
                  }}
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[var(--accent-soft)]"
                >
                  💾 Salvar rádio
                </button>
                {radioMsg && (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{radioMsg}</span>
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
            <div className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <p>
                ⚠️ A nuvem ainda <strong>não está ativa</strong>. Enquanto isso, as
                matérias ficam salvas só neste aparelho e o WhatsApp não consegue
                mostrar a foto. Siga o passo a passo:
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Abra{" "}
                  <a
                    href="https://vercel.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline"
                  >
                    vercel.com/dashboard
                  </a>{" "}
                  e clique no projeto <strong>novo-portal-premium</strong>
                </li>
                <li>No menu superior do projeto, entre na aba <strong>Storage</strong></li>
                <li>
                  <strong>Create Database</strong> → escolha <strong>Blob</strong>
                </li>
                <li>
                  Nome: <code>portal-nova</code>. IMPORTANTE: <strong>marque a
                  caixinha</strong> “Add a read-write token env var to this
                  connection” — sem ela a nuvem não liga!
                </li>
                <li>Clique em <strong>Create</strong> e confirme a conexão com o projeto</li>
                <li>
                  Aba <strong>Deployments</strong> → três pontinhos (⋯) no último
                  deploy → <strong>Redeploy</strong> → confirme
                </li>
                <li>
                  Volte aqui e recarregue a página (F5) — o aviso vira
                  “✅ Nuvem ativa”
                </li>
              </ol>
            </div>
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
                refresh();
                setActions(listQuickActions());
                if (cloudActive) {
                  syncAllLocalToServer().then(({ total, ok }) => {
                    setBackupMsg(
                      `✅ Backup restaurado: ${data.articles.length} matérias recarregadas (${ok}/${total} enviadas para a nuvem).`,
                    );
                  });
                } else {
                  setBackupMsg(
                    `✅ Backup restaurado: ${data.articles.length} matérias recarregadas.`,
                  );
                }
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
                    {displayViews(a).toLocaleString("pt-BR")} views
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
                        refresh();
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
                      if (
                        !window.confirm(
                          `Excluir a matéria “${a.title}”? Essa ação não pode ser desfeita.`,
                        )
                      )
                        return;
                      deleteArticle(a.id);
                      await deleteArticleFromServer(a.slug);
                      refresh();
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
