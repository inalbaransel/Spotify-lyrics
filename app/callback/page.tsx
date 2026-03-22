"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCodeVerifier, clearCodeVerifier } from "@/lib/spotify-auth";
import { saveTokens } from "@/lib/token-store";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      router.replace("/login");
      return;
    }

    const codeVerifier = getCodeVerifier();
    if (!codeVerifier) {
      router.replace("/login");
      return;
    }

    fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, codeVerifier }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          saveTokens(data.access_token, data.refresh_token, data.expires_in);
          clearCodeVerifier();
          router.replace("/player");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => router.replace("/login"));
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#E8D5B0]">
      <p
        className="text-2xl text-[#3B2A1A]"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        Bağlanıyor...
      </p>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
