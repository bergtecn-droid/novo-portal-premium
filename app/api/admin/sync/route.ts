import {
  materializeArticleMedia,
  readPortalSettings,
  readPublished,
  storageActive,
  writePublished,
} from "@/lib/server-articles";
import { readLockState } from "@/lib/server-lock";
import { adminAuthorized } from "@/lib/server-admin-auth";
import type { Article } from "@/lib/types";

export async function GET() {
  if (!(await adminAuthorized())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const state = await readLockState();
  return Response.json({
    storage: storageActive(),
    lock: {
      locked: state.locked,
      source: state.source,
    },
  });
}

export async function POST(req: Request) {
  if (!(await adminAuthorized())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await req.json()) as { article?: Article };
  const article = body.article;
  if (!article || typeof article.slug !== "string") {
    return Response.json({ error: "Matéria inválida" }, { status: 400 });
  }
  const materialized = await materializeArticleMedia(article);
  const list = await readPublished();
  const idx = list.findIndex((a) => a.id === materialized.id);
  if (idx >= 0) list[idx] = materialized;
  else list.push(materialized);
  await writePublished(list);
  return Response.json({ ok: true, total: list.length });
}

export async function DELETE(req: Request) {
  if (!(await adminAuthorized())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await req.json()) as { slug?: string };
  if (!body.slug) {
    return Response.json({ error: "Slug ausente" }, { status: 400 });
  }
  const list = (await readPublished()).filter((a) => a.slug !== body.slug);
  await writePublished(list);
  return Response.json({ ok: true, total: list.length });
}
