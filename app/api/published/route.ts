import { sortArticles } from "@/lib/articles";
import { readPublished } from "@/lib/server-articles";

export async function GET() {
  const articles = sortArticles(await readPublished());
  return Response.json({ articles });
}
