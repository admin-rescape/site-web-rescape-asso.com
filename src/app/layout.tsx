import type { Metadata } from "next";
import { Pacifico, Playfair_Display, Lato, Nunito, Bebas_Neue } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rescape - Lutte Anti Gaspillage Solidaire",
  description: "Association solidaire à Aniche (59580)",
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import NextAuthProvider from "@/components/providers/SessionProviderWrapper";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const currentPath = headersList.get("x-invoke-path") || "";
  const isAdminPath = currentPath.startsWith("/admin");

  return (
    <html lang="fr" className="h-full">
      <body
        className={`${pacifico.variable} ${playfair.variable} ${lato.variable} ${nunito.variable} ${bebas.variable} antialiased bg-background text-dark font-lato min-h-screen flex flex-col`}
      >
        {/* Skip link — WCAG 2.1 AA — premier élément focusable */}
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Aller au contenu principal
        </a>
        <NextAuthProvider>
          {!isAdminPath && <Navbar />}
          <main id="contenu-principal" className="flex-grow flex flex-col">
            {children}
          </main>
          {!isAdminPath && <Footer />}
          {!isAdminPath && <CookieBanner />}
        </NextAuthProvider>
        {/* Analytics — Plausible (Privacy First) */}
        {!isAdminPath && (
          <script defer data-domain="rescape.org" src="https://plausible.io/js/script.js"></script>
        )}
      </body>
    </html>
  );
}

