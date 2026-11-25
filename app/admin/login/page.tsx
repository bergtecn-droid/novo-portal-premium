"use client";

import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Senha incorreta. Tente novamente.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 dark:bg-[#0b1120]">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-[#0f1a30]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold">Nova</span>
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neutral-950">
              Admin
            </span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="font-display text-xl font-bold">Acesso restrito</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Digite a senha para entrar no painel.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha do painel"
            autoFocus
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-500 dark:border-neutral-700"
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-xs text-neutral-400 hover:text-amber-600"
        >
          ← Voltar para o portal
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
