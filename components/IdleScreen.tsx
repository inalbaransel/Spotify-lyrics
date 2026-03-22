"use client";

export function IdleScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "#E8D5B0" }}
    >
      <p
        className="text-3xl text-center px-8"
        style={{ color: "#9B7D5A", fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        şu an bir şey çalmıyor.
      </p>
    </div>
  );
}
