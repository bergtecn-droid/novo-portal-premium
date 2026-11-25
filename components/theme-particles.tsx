"use client";

import { useEffect, useState } from "react";

const PARTICLES: Record<string, string[]> = {
  natal: ["❄️", "🎄", "🎁", "🔔", "⛄"],
  anonovo: ["🎉", "✨", "🎆", "🥂", "🎊"],
  pascoa: ["🐰", "🥚", "🐣", "🌷", "🤍"],
  junina: ["🌽", "🎪", "🎈", "🏮", "🎶"],
  verao: ["☀️", "🌊", "🍉", "🌴", "⛱️"],
  outono: ["🍂", "🍁", "🌰", "🧡", "🍃"],
  inverno: ["❄️", "⛄", "🧣", "☕", "☁️"],
  primavera: ["🌸", "🌷", "🌼", "🦋", "🌿"],
};

const COUNT = 18;

function randomBlob(emojiPool: string[]) {
  return {
    emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
    left: Math.random() * 100,
    duration: 10 + Math.random() * 12,
    delay: -Math.random() * 20,
    size: 16 + Math.random() * 18,
    sway: Math.random() > 0.5 ? 24 + Math.random() * 60 : -(24 + Math.random() * 60),
    opacity: 0.68 + Math.random() * 0.3,
  };
}

export function ThemeParticles() {
  const [blobs, setBlobs] = useState<ReturnType<typeof randomBlob>[]>([]);
  const [theme, setTheme] = useState<string>("padrao");

  useEffect(() => {
    const html = document.documentElement;
    const read = () => {
      const next = html.getAttribute("data-theme") ?? "padrao";
      setTheme(next);
      const pool = PARTICLES[next];
      setBlobs(pool ? Array.from({ length: COUNT }, () => randomBlob(pool)) : []);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  if (!blobs.length || theme === "padrao") return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[25] overflow-hidden">
      {blobs.map((b, i) => (
        <span
          key={`${theme}-${i}`}
          className="theme-particle"
          style={{
            left: `${b.left}%`,
            fontSize: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            ["--p-sway" as string]: `${b.sway}px`,
            ["--p-opacity" as string]: b.opacity,
          }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}
