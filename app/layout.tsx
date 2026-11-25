import type { Metadata } from "next";
import { RadioPlayer } from "@/components/radio-player";
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
function autoTheme() {
  var m = new Date().getMonth();
  if (m === 11) return "natal";
  if (m === 0) return "anonovo";
  if (m === 3 || m === 4) return "pascoa";
  if (m === 5 || m === 6) return "junina";
  if (m >= 8 && m <= 10) return "primavera";
  if (m >= 2 && m <= 4) return "outono";
  if (m >= 5 && m <= 7) return "inverno";
  return "verao";
}
try {
  var t = localStorage.getItem("portal-nova.themeSeason") || "auto";
  var seasonal = t === "auto" ? autoTheme() : t;
  if (seasonal && seasonal !== "padrao") {
    document.documentElement.setAttribute("data-theme", seasonal);
  }
  var mode = localStorage.getItem("portal-nova.theme");
  if (mode === "dark" || (!mode && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
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
      <body className="bg-neutral-50 pb-28 text-neutral-900 antialiased dark:bg-[#0b1120] dark:text-neutral-100">
        {children}
        <RadioPlayer />
      </body>
    </html>
  );
}
