"use client";

export function ThemeToggle() {
  return (
    <button
      onClick={() => {
        const el = document.documentElement;
        const dark = el.classList.toggle("dark");
        localStorage.setItem("portal-nova.theme", dark ? "dark" : "light");
      }}
      aria-label="Alternar tema claro/escuro"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-sm transition hover:scale-110 hover:border-[var(--accent)] dark:border-neutral-700"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
