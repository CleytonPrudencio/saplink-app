import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import TechBackground from "@/components/TechBackground";
import TopProgress from "@/components/TopProgress";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DESC = "Monitore, preveja, corrija e prove valor em R$ nas integrações SAP — do IDoc clássico ao S/4HANA Cloud. Plataforma multi-cliente e white-label, com IA de ponta a ponta.";

export const metadata: Metadata = {
  metadataBase: new URL("https://saplink.com.br"),
  title: {
    default: "SAPLINK — Operação de integrações SAP",
    template: "%s · SAPLINK",
  },
  description: DESC,
  applicationName: "SAPLINK",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "SAPLINK", statusBarStyle: "black-translucent" },
  keywords: ["SAP", "integração", "monitoramento", "S/4HANA Cloud", "CPI", "IDoc", "AMS", "consultoria SAP"],
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://saplink.com.br",
    siteName: "SAPLINK",
    title: "SAPLINK — Operação de integrações SAP",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SAPLINK — operação de integrações SAP" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAPLINK — Operação de integrações SAP",
    description: DESC,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} style={{ backgroundColor: "#0f0b1a" }}>
      <body className="min-h-full bg-transparent text-[#e2e0ea] font-[family-name:var(--font-inter)]">
        <TechBackground />
        <TopProgress />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
