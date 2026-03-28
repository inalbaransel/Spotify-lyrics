import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Lyrics",
  description: "Spotify synchronized lyrics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${playfair.variable} font-display antialiased`}>
        <Script
          src="/live2dcubismcore.min.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
