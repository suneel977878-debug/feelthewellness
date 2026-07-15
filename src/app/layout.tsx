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
  title: "FeelTheWelllness | Ultimate Wellness & Premium Adult Store",
  description: "Indulge in the finest luxury sex toys designed for ultimate intimacy, sensory gratification, and sexual pleasure. Dispatched in 100% discreet packaging.",
};

import { getProducts } from "./actions/products";
import { getStoreConfig, getPromos } from "./actions/config";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getStoreConfig();
  const promos = await getPromos();

  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={`${playfair.variable} ${jakarta.variable}`}>
      <body>
        <CartProvider initialConfig={config} initialPromos={promos}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
