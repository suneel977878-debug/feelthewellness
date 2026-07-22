import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: "FeelTheWellness | Ultimate Wellness & Premium Adult Store",
  description: "Indulge in the finest luxury sex toys designed for ultimate intimacy, sensory gratification, and sexual pleasure. Dispatched in 100% discreet packaging.",
  metadataBase: new URL("https://feelthewellness.vercel.app"),
  openGraph: {
    title: "FeelTheWellness | Ultimate Wellness & Premium Adult Store",
    description: "Indulge in the finest luxury sex toys designed for ultimate intimacy, sensory gratification, and sexual pleasure. Dispatched in 100% discreet packaging.",
    url: "https://feelthewellness.vercel.app",
    siteName: "FeelTheWellness",
    images: [
      {
        url: "/hero.webp",
        width: 1200,
        height: 630,
        alt: "FeelTheWellness Luxury Store",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FeelTheWellness | Ultimate Wellness & Premium Adult Store",
    description: "Indulge in the finest luxury sex toys designed for ultimate intimacy.",
    images: ["/hero.webp"],
  },
};

import { getProducts } from "./actions/products";
import { getStoreConfig } from "./actions/config";
import AgeGate from "../components/AgeGate";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getStoreConfig();

  return (
    <html lang="en" suppressHydrationWarning data-theme="dark" data-scroll-behavior="smooth" className={`${playfair.variable} ${jakarta.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('feel_the_wellness_theme');
                if (savedTheme) {
                  document.documentElement.setAttribute('data-theme', savedTheme);
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body>
        <CartProvider initialConfig={config}>
          <AgeGate />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
