"use client";

import { buildAuthUrl } from "@/lib/spotify-auth";

export default function LoginPage() {
  async function handleLogin() {
    const url = await buildAuthUrl();
    window.location.href = url;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#E8D5B0]">
      <h1
        className="text-6xl font-black text-[#3B2A1A] mb-12 tracking-tight"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        lyrics.
      </h1>
      <button
        onClick={handleLogin}
        className="px-8 py-4 bg-[#3B2A1A] text-[#E8D5B0] text-lg font-bold tracking-widest uppercase hover:bg-[#6B4C2A] transition-colors cursor-pointer"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        Spotify&apos;a Bağlan
      </button>
    </main>
  );
}
