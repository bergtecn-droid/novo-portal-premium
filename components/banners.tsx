"use client";

import { useSettings } from "@/lib/settings";
import type { BannerPosition } from "@/lib/settings";

export function BannerStrip({ position }: { position: BannerPosition }) {
  const settings = useSettings();
  const banners = (settings.banners ?? []).filter(
    (b) => b.active && b.position === position && b.imageUrl,
  );
  if (banners.length === 0) return null;

  return (
    <section className={position === "lateral" ? "" : "mt-10"}>
      {position === "materia" && (
        <h2 className="font-display flex items-center gap-3 text-xl font-bold">
          Ofertas dos anunciantes
          <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </h2>
      )}
      <div
        className={`${
          position === "materia" ? "mt-4 " : ""
        }grid gap-4 sm:grid-cols-2`}
      >
        {banners.map((b) => {
          const img = (
            <img
              src={b.imageUrl}
              alt={b.title}
              className="w-full object-cover"
            />
          );
          const boxClass =
            "block overflow-hidden rounded-2xl border border-neutral-200 shadow-sm transition hover:shadow-md dark:border-neutral-800";
          return b.linkUrl ? (
            <a
              key={b.id}
              href={b.linkUrl}
              target={b.linkUrl.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={boxClass}
              title={b.title}
            >
              {img}
            </a>
          ) : (
            <div
              key={b.id}
              className={boxClass}
              title={b.title}
            >
              {img}
            </div>
          );
        })}
      </div>
    </section>
  );
}
