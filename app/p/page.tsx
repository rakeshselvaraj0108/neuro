"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { decodeFragmentToPiece, type DecodedSharedPiece } from "@/lib/share/encode";
import { THEMES, type PresentationTheme } from "@/lib/presentation/themes";
import { ExportCanvas } from "@/components/export/ExportCanvas";

export default function SharedPiecePage() {
  const [sharedData, setSharedData] = useState<DecodedSharedPiece | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const decoded = decodeFragmentToPiece(hash);
      setSharedData(decoded);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0B0A0E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#B8B0A2", fontFamily: "sans-serif" }}>Opening shared piece...</p>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0B0A0E",
          color: "#F4EFE6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          padding: "20px",
          textAlign: "center",
          fontFamily: "var(--font-ui), sans-serif",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "24px", color: "#D9364A" }}>
          Fragment Expired or Missing
        </h2>
        <p style={{ maxWidth: "400px", color: "#B8B0A2", fontSize: "14px", lineHeight: "1.5" }}>
          This shared piece link doesn&apos;t contain a valid piece fragment. Create your own finished piece with Catch the Flood.
        </p>
        <Link
          href="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#8B1E2B",
            color: "#F4EFE6",
            borderRadius: "20px",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          Catch your own flood →
        </Link>
      </div>
    );
  }

  const { piece, themeKey } = sharedData;
  const theme: PresentationTheme = THEMES[themeKey] || THEMES.bloodmoon;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.ground,
        color: theme.textPrimary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px 60px 20px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            backgroundColor: theme.panel,
            border: `1px solid ${theme.accent}`,
            borderRadius: "20px",
            color: theme.textPrimary,
            textDecoration: "none",
            fontFamily: "var(--font-ui), sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          <span>Catch your own flood →</span>
        </Link>
      </header>

      <main style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "1200px" }}>
        <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
          <ExportCanvas piece={piece} theme={theme} hidden={false} />
        </div>
      </main>
    </div>
  );
}
