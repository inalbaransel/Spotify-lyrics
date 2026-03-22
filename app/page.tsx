"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokens } from "@/lib/token-store";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const tokens = getTokens();
    if (tokens) {
      router.replace("/player");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
