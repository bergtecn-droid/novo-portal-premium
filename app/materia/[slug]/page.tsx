import type { Metadata } from "next";
import { ArticleView } from "@/components/article-view";
import { findArticle, sortArticles } from "@/lib/articles";
import { seedArticles } from "@/lib/seed";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://novo-portal-premium.vercel.app";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(sortArticles(seedArticles), slug);

  if (!article || article.status !== "publicado") {
    return { title: "Matéria não encontrada — Portal Nova" };
  }

  const ogImage = article.cover || undefined;
  return {
    title: article.title,
    description: article.subtitle,
    alternates: { canonical: `${siteUrl}/materia/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author] : undefined,
      url: `${siteUrl}/materia/${article.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 675 }] : undefined,
      siteName: "Portal Nova",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.subtitle,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
}
