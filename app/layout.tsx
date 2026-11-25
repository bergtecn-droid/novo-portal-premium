import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Nova — Notícias com clareza",
  description:
    "Portal de notícias moderno: cidade, política, economia, esportes, entretenimento e tecnologia.",
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
