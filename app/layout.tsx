import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://novo-portal-premium.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Portal Nova — Notícias com clareza",
    template: "%s — Portal Nova",
  },
  description:
    "Portal de notícias moderno: cidade, política, economia, esportes, entretenimento e tecnologia.",
  openGraph: {
    type: "website",
    siteName: "Portal Nova",
    locale: "pt_BR",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

const themeInit = `
try {
  const t = localStorage.getItem("portal-nova.theme");
  if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..800&family=Inter:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-neutral-50 text-neutral-900 antialiased dark:bg-[#0b1120] dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
