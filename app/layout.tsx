import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
