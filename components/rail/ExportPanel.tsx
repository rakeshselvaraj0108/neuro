"use client";

import { useState } from "react";

import { DownloadIcon } from "@/components/icons/DownloadIcon";
import { FileTextIcon } from "@/components/icons/FileTextIcon";
import { ImageIcon } from "@/components/icons/ImageIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { IconTile } from "@/components/ui/IconTile";
import { Panel } from "@/components/ui/Panel";
import type { Piece } from "@/types/domain";

const ROWS = [
  { key: "png", name: "PNG Image", sublabel: "High Quality", icon: ImageIcon },
  { key: "pdf", name: "PDF File", sublabel: "Print Ready", icon: FileTextIcon },
  { key: "share", name: "Share Card", sublabel: "Share Anywhere", icon: ShareIcon },
] as const;

function pieceText(piece: Piece): string {
  return [piece.title, "", ...piece.stanzas.map((stanza) => stanza.map((segment) => segment.text).join(""))].join("\n\n");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function ExportPanel({ piece }: { piece: Piece }) {
  const [message, setMessage] = useState("");
  const text = pieceText(piece);

  const downloadPng = async () => {
    try {
      const lines = text.split("\n");
      const height = Math.max(900, 280 + lines.length * 52);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${height}"><rect width="100%" height="100%" fill="#070406"/><text x="120" y="150" fill="#ede4dc" font-family="Georgia,serif" font-size="56">${escapeHtml(piece.title)}</text>${lines.map((line, index) => `<text x="120" y="${250 + index * 52}" fill="#ede4dc" font-family="Georgia,serif" font-size="30">${escapeHtml(line)}</text>`).join("")}</svg>`;
      const image = new Image();
      const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image rendering failed"));
        image.src = source;
      });
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      URL.revokeObjectURL(source);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "catch-the-flood-piece.png";
      link.click();
      setMessage("PNG downloaded.");
    } catch {
      setMessage("PNG export could not be created.");
    }
  };

  const printPdf = () => {
    const popup = window.open("", "_blank");
    if (!popup) { setMessage("Allow pop-ups to print this piece."); return; }
    popup.document.write(`<!doctype html><title>${escapeHtml(piece.title)}</title><style>body{max-width:700px;margin:72px auto;font:20px/1.7 Georgia,serif}p{white-space:pre-wrap}</style><h1>${escapeHtml(piece.title)}</h1><p>${escapeHtml(text)}</p>`);
    popup.document.close();
    popup.focus();
    popup.print();
    setMessage("Choose Save as PDF in the print dialog.");
  };

  const share = async () => {
    try {
      const nativeShare = (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share;
      if (nativeShare) await nativeShare.call(navigator, { title: piece.title, text });
      else await navigator.clipboard.writeText(text);
      setMessage(nativeShare ? "Share sheet opened." : "Piece copied to your clipboard.");
    } catch {
      setMessage("Sharing was cancelled.");
    }
  };

  const actions = { png: downloadPng, pdf: printPdf, share };
  return (
    <Panel label="Export Your Piece" labelId="export-heading">
      <div className="export" role="group" aria-labelledby="export-heading">
        {ROWS.map((row) => (
          <button key={row.key} type="button" className="export__row" onClick={actions[row.key]}>
            <IconTile><row.icon size={15} /></IconTile>
            <span><span className="export__name">{row.name}</span><span className="export__sub">{row.sublabel}</span></span>
            <span className="export__trail"><DownloadIcon size={13} /></span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{message}</p>
    </Panel>
  );
}
