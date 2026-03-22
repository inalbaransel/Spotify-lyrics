"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokens } from "@/lib/token-store";
import { LyricsPlayer } from "@/components/LyricsPlayer";

export default function PlayerPage() {
  const router = useRouter();

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens) {
      router.replace("/login");
    }
  }, [router]);

  return <LyricsPlayer />;
}
