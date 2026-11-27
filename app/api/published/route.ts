import { sortArticles } from "@/lib/articles";
import { readPublished } from "@/lib/server-articles";
import { siteUnlocked } from "@/lib/server-lock";

export async function GET() {
  // Portal bloqueado: matérias não vazam para quem não tem a senha.
  if (!(await siteUnlocked())) {
    return Response.json({ articles: [] });
  }
  const articles = sortArticles(await readPublished());
  return Response.json({ articles });
}
