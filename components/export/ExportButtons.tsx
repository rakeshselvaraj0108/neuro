"use client";

import { useRef, useState } from "react";
import type { Piece } from "@/types/domain";
import { useEffectiveTheme } from "@/hooks/useEffectiveTheme";
import { exportPieceAsPng, exportPieceAsPdf } from "@/lib/export/renderCard";
import { ExportCanvas } from "@/components/export/ExportCanvas";
import { SharePopover } from "@/components/export/SharePopover";
import { Toast } from "@/components/ui/Toast";

interface ExportButtonsProps {
  piece: Piece;
}

type FormatKey = "png" | "pdf" | "share";
type FormatStatus = "idle" | "working" | "done" | "error";

export function ExportButtons({ piece }: ExportButtonsProps) {
  const exportCanvasRef = useRef<HTMLDivElement | null>(null);
  const { effectiveTheme, userThemeKey, suggestedThemeKey } = useEffectiveTheme();

  const [statuses, setStatuses] = useState<Record<FormatKey, FormatStatus>>({
    png: "idle",
    pdf: "idle",
    share: "idle",
  });

  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeThemeKey = userThemeKey ?? suggestedThemeKey ?? "bloodmoon";

  const setStatus = (key: FormatKey, status: FormatStatus) => {
    setStatuses((prev) => ({ ...prev, [key]: status }));
  };

  const handleExportPng = async () => {
    if (!exportCanvasRef.current || statuses.png === "working") return;

    setStatus("png", "working");
    setToastMessage("Generating high-res gallery poster PNG...");

    try {
      await exportPieceAsPng(exportCanvasRef.current, piece.title);
      setStatus("png", "done");
      setToastMessage(`Saved "${piece.title}.png" with full fidelity stamp.`);
      setTimeout(() => setStatus("png", "idle"), 2500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("PNG export failed:", err);
      setStatus("png", "error");
      setToastMessage("Couldn't build image just now — try again in a moment.");
      setTimeout(() => setStatus("png", "idle"), 3000);
    }
  };

  const handleExportPdf = async () => {
    if (!exportCanvasRef.current || statuses.pdf === "working") return;

    setStatus("pdf", "working");
    setToastMessage("Building print-ready PDF document...");

    try {
      await exportPieceAsPdf(exportCanvasRef.current, piece.title);
      setStatus("pdf", "done");
      setToastMessage(`Saved "${piece.title}.pdf" ready to print.`);
      setTimeout(() => setStatus("pdf", "idle"), 2500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("PDF export failed:", err);
      setStatus("pdf", "error");
      setToastMessage("Couldn't build PDF just now — try the PNG export.");
      setTimeout(() => setStatus("pdf", "idle"), 3000);
    }
  };

  return (
    <>
      <div className="export-buttons-group" role="group" aria-label="Export and Share options">
        {/* PNG Export */}
        <button
          type="button"
          className={`finished-control-btn ${statuses.png === "working" ? "finished-control-btn--working" : ""}`}
          onClick={handleExportPng}
          disabled={statuses.png === "working"}
          aria-label="Export piece as PNG image"
          title="Export gallery poster as crisp PNG"
        >
          <span>{statuses.png === "working" ? "PNG…" : "PNG"}</span>
        </button>

        {/* PDF Export */}
        <button
          type="button"
          className={`finished-control-btn ${statuses.pdf === "working" ? "finished-control-btn--working" : ""}`}
          onClick={handleExportPdf}
          disabled={statuses.pdf === "working"}
          aria-label="Export piece as PDF document"
          title="Export print-ready PDF document"
        >
          <span>{statuses.pdf === "working" ? "PDF…" : "PDF"}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          className="finished-control-btn finished-control-btn--share"
          onClick={() => setSharePopoverOpen(true)}
          aria-label="Copy shareable link and view QR code"
          title="Zero-storage shareable link & QR code"
        >
          <span>Share</span>
        </button>
      </div>

      {/* Toast Notification */}
      <Toast
        open={!!toastMessage}
        message={toastMessage || ""}
        onDismiss={() => setToastMessage(null)}
      />

      {/* Off-screen export render target */}
      <ExportCanvas
        ref={exportCanvasRef}
        piece={piece}
        theme={effectiveTheme}
        hidden={true}
      />

      {/* Share Popover Dialog */}
      {sharePopoverOpen ? (
        <SharePopover
          piece={piece}
          themeKey={activeThemeKey}
          onClose={() => setSharePopoverOpen(false)}
          onExportPng={handleExportPng}
        />
      ) : null}
    </>
  );
}
