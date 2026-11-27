import type { Metadata } from "next";
import { InstPageView } from "@/components/inst-page-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const titles: Record<string, string> = {
    "quem-somos": "Quem somos",
    "anuncie-aqui": "Anuncie aqui",
    "fale-com-a-redacao": "Fale com a redação",
  };
  const title = titles[slug] ?? "Institucional";
  return { title: `${title} — Portal Nova` };
}

export default async function InstPage({ params }: Props) {
  const { slug } = await params;
  return <InstPageView slug={slug} />;
}
