import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken } from "@/lib/auth";
import { readPublished, writePublished } from "@/lib/server-articles";
import type { Article } from "@/lib/types";

async function authorized(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(token && token === (await adminToken()));
}

export async function POST(req: Request) {
  if (!(await authorized())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await req.json()) as { article?: Article };
  const article = body.article;
  if (!article || typeof article.slug !== "string") {
    return Response.json({ error: "Matéria inválida" }, { status: 400 });
  }
  const list = await readPublished();
  const idx = list.findIndex((a) => a.id === article.id);
  if (idx >= 0) list[idx] = article;
  else list.push(article);
  await writePublished(list);
  return Response.json({ ok: true, total: list.length });
}

export async function DELETE(req: Request) {
  if (!(await authorized())) {
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
