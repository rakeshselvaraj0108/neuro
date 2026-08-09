"use client";

import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { Piece } from "@/types/domain";
import type { PresentationTheme } from "@/lib/presentation/themes";
import { BackdropRenderer } from "@/components/piece/BackdropRenderer";
import { Flourish } from "@/components/piece/Flourish";
import { MoonDivider } from "@/components/piece/MoonDivider";
import { WaxSeal } from "@/components/piece/WaxSeal";
import { Verbatim } from "@/components/piece/Verbatim";

interface ExportCanvasProps {
  piece: Piece;
  theme: PresentationTheme;
  hidden?: boolean;
}

export const ExportCanvas = forwardRef<HTMLDivElement, ExportCanvasProps>(
  ({ piece, theme, hidden = true }, ref) => {
    const totalSegments = piece.fidelity.captured + piece.fidelity.invented;

    const themeVars: CSSProperties = {
      "--theme-ground": theme.ground,
      "--theme-canvas": theme.canvas,
      "--theme-panel": theme.panel,
      "--theme-accent": theme.accent,
      "--theme-accent-bright": theme.accentBright,
      "--theme-verbatim-glow": theme.verbatimGlow,
      "--theme-text-primary": theme.textPrimary,
      "--theme-text-dim": theme.textDim,
      "--theme-text-faint": theme.textFaint,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className="export-canvas-mount"
        aria-hidden="true"
        style={{
          position: hidden ? "fixed" : "relative",
          left: hidden ? "-9999px" : undefined,
          top: hidden ? "-9999px" : undefined,
          width: "1200px",
          height: "1500px",
          backgroundColor: theme.ground,
          color: theme.textPrimary,
          zIndex: hidden ? -100 : undefined,
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "var(--font-cormorant), Georgia, serif",
          boxSizing: "border-box",
          padding: "60px",
          ...themeVars,
        }}
      >
        <div
          className="export-canvas-frame"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundColor: theme.canvas,
            border: `2px solid ${theme.accent}`,
            boxSizing: "border-box",
            padding: "80px 70px 100px 70px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            borderRadius: "4px",
          }}
        >
          <BackdropRenderer kind={theme.backdropKind} />

          <Flourish corner="tl" size={48} />
          <Flourish corner="tr" size={48} />
          <Flourish corner="bl" size={48} />
          <Flourish corner="br" size={48} />

          {/* Title and Divider */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 5 }}>
            <h1
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "42px",
                fontWeight: 600,
                color: theme.accentBright,
                margin: "0 0 16px 0",
                letterSpacing: "1px",
                lineHeight: "1.2",
              }}
            >
              {piece.title}
            </h1>
            <MoonDivider kind={theme.backdropKind} />
          </div>

          {/* Stanzas Body */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              margin: "40px 0",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            {piece.stanzas.map((stanza, sIdx) => (
              <div
                key={sIdx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "26px",
                  lineHeight: "1.6",
                  color: theme.textPrimary,
                }}
              >
                {stanza.map((segment, segIdx) => (
                  <p key={segIdx} style={{ margin: 0 }}>
                    {segment.origin === "captured" ? (
                      <span style={{ color: theme.verbatimGlow }}>
                        <Verbatim>{segment.text}</Verbatim>
                      </span>
                    ) : (
                      segment.text
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom Stamp & Branding Footer */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              borderTop: `1px solid ${theme.accent}`,
              paddingTop: "24px",
              marginTop: "auto",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-ui), sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: theme.textDim,
                  margin: 0,
                }}
              >
                Catch the Flood
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui), sans-serif",
                  fontSize: "12px",
                  color: theme.textFaint,
                  margin: "4px 0 0 0",
                }}
              >
                Your voice, finished.
              </p>
            </div>

            {/* FIDELITY STAMP */}
            <div
              style={{
                textAlign: "center",
                padding: "8px 16px",
                backgroundColor: theme.panel,
                border: `1px solid ${theme.accent}`,
                borderRadius: "20px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-ui), sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: theme.textPrimary,
                  margin: 0,
                  letterSpacing: "0.5px",
                }}
              >
                {piece.fidelity.captured} of {totalSegments} words are the creator&apos;s own
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui), sans-serif",
                  fontSize: "11px",
                  color: theme.textDim,
                  margin: "2px 0 0 0",
                }}
              >
                Finished with Catch the Flood
              </p>
            </div>

            <div style={{ width: "80px", height: "80px" }}>
              <WaxSeal />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ExportCanvas.displayName = "ExportCanvas";
