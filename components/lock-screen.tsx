"use client";

import { useState } from "react";

export function LockScreen({
  portalName,
  logoUrl,
}: {
  portalName?: string;
  logoUrl?: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Senha incorreta. Tente de novo.");
      setBusy(false);
    } catch {
      setError("Não foi possível verificar a senha. Tente de novo.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-4 text-neutral-100">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="mx-auto mb-4 max-h-16 rounded-xl bg-white/90 object-contain px-3 py-2"
          />
        ) : (
          <div className="mb-4 text-5xl">🔒</div>
        )}
        <h1 className="font-display text-2xl font-bold">
          {portalName ? `Portal ${portalName}` : "Portal protegido"}
        </h1>
        <p className="mt-2 text-sm text-neutral-300">
          Este portal está bloqueado. Digite a senha de acesso para continuar.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            autoFocus
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center text-lg tracking-widest text-white placeholder-neutral-400 outline-none transition focus:border-white/40"
          />
          <button
            type="submit"
            disabled={busy || !password.trim()}
            className="w-full rounded-xl bg-[var(--accent,#f5b301)] px-4 py-3 font-bold text-neutral-950 transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Verificando…" : "🔓 Entrar no portal"}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm font-semibold text-red-300">{error}</p>
        )}
        <p className="mt-6 text-xs text-neutral-500">
          Acesso restrito. Não tem a senha? Fale com a administração.
        </p>
      </div>
    </div>
  );
}
