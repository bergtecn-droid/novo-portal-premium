import Link from "next/link";
import {
  DEFAULT_INST_LINKS,
  DEFAULT_TAGLINE,
  fullPortalName,
  useSettings,
} from "@/lib/settings";

export function SiteFooter() {
  const settings = useSettings();
  const editorias = settings.editorias;
  const tagline = settings.tagline || DEFAULT_TAGLINE;
  const instLinks =
    settings.instLinks && settings.instLinks.length > 0
      ? settings.instLinks
      : DEFAULT_INST_LINKS;

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0d1526]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.portalName}
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold">
                {settings.portalName}
              </span>
              <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neutral-950">
                Portal
              </span>
            </div>
          )}
          <p className="mt-3 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
            {tagline}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Editorias
          </h4>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
            {editorias.map((e) => (
              <li key={e}>
                <Link
                  href={`/editoria/${encodeURIComponent(e.toLowerCase())}`}
                  className="hover:text-[var(--accent-strong)]"
                >
                  {e}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Institucional
          </h4>
          <ul className="mt-3 space-y-1 text-sm">
            {instLinks.map((l, i) => (
              <li key={i}>
                {l.url ? (
                  l.url.startsWith("http") ? (
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--accent-strong)]"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.url}
                      className="hover:text-[var(--accent-strong)]"
                    >
                      {l.label}
                    </Link>
                  )
                ) : (
                  <span className="text-neutral-600 dark:text-neutral-300">
                    {l.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-400 dark:border-neutral-800">
        © {new Date().getFullYear()} {fullPortalName(settings)}. Todos os
        direitos reservados.
      </div>
    </footer>
  );
}
