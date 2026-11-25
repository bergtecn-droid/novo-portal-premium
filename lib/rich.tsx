import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      return <u key={key}>{part.slice(2, -2)}</u>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={key}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--accent-strong)] underline underline-offset-2 dark:text-[var(--accent-strong-dark)]"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

export function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = (text ?? "").replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  const list: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    const items = list.splice(0, list.length);
    out.push(
      <ul key={`ul-${out.length}`} className="list-disc space-y-1.5 pl-6">
        {items.map((item, i) => (
          <li key={i}>{inline(item, `li-${out.length}-${i}`)}</li>
        ))}
      </ul>,
    );
  };

  let blockIdx = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    out.push(<p key={`p-${blockIdx}`}>{inline(line, `p-${blockIdx}`)}</p>);
    blockIdx += 1;
  }
  flushList();

  return <div className={className}>{out}</div>;
}
