const VERIFIER_KEY = "pkce_verifier";

function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((x) => chars[x % chars.length])
    .join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function buildAuthUrl(): Promise<string> {
  const verifier = generateRandomString(128);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const challenge = base64urlEncode(await sha256(verifier));

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: "user-read-currently-playing user-read-playback-state",
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

export function getCodeVerifier(): string | null {
  return sessionStorage.getItem(VERIFIER_KEY);
}

export function clearCodeVerifier() {
  sessionStorage.removeItem(VERIFIER_KEY);
}
