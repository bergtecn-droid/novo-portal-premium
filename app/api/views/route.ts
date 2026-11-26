import { readPublished, storageActive, writePublished } from "@/lib/server-articles";

export async function POST(req: Request) {
  if (!storageActive()) {
    return Response.json({ views: null });
  }
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!body.slug) {
    return Response.json({ views: null });
  }
  const list = await readPublished();
  const article = list.find(
    (a) => a.slug === body.slug && a.status === "publicado",
  );
  if (!article) {
    return Response.json({ views: null });
  }
  article.views = (article.views ?? 0) + 1;
  await writePublished(list);
  return Response.json({ views: article.views });
}
