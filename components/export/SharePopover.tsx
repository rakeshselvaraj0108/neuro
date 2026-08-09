"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Piece } from "@/types/domain";
import type { ThemeKey } from "@/lib/presentation/themes";
import { encodePieceToFragment, isUrlLengthValid } from "@/lib/share/encode";
import { Toast } from "@/components/ui/Toast";

interface SharePopoverProps {
  piece: Piece;
  themeKey: ThemeKey;
  onClose: () => void;
  onExportPng?: () => void;
}

export function SharePopover({
  piece,
  themeKey,
  onClose,
  onExportPng,
}: SharePopoverProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isValidLength, setIsValidLength] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fragment = encodePieceToFragment(piece, themeKey);
    const fullUrl = `${origin}/p#${fragment}`;
    setShareUrl(fullUrl);

    const valid = isUrlLengthValid(piece, themeKey, origin);
    setIsValidLength(valid);

    if (valid && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 140,
          margin: 2,
          color: {
            dark: "#14121A",
            light: "#FFFFFF",
          },
        },
        (err) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.warn("QR code render error:", err);
          }
        },
      );
    }
  }, [piece, themeKey]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setToastMessage("Link copied to clipboard — ready to share!");
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setToastMessage("Select and copy the URL from the input box.");
    }
  };

  return (
    <>
      <div
        className="share-popover-overlay"
        onClick={onClose}
        role="dialog"
        aria-label="Share finished piece"
        aria-modal="true"
      >
        <div
          className="share-popover-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="share-popover__header">
            <h3 className="share-popover__title">Share Finished Piece</h3>
            <button
              type="button"
              className="share-popover__close"
              onClick={onClose}
              aria-label="Close share dialog"
            >
              ✕
            </button>
          </div>

          <p className="share-popover__privacy-note">
            🔒 Zero-Storage Link: The piece lives entirely inside the URL fragment (#). Nothing is sent to or stored on any server.
          </p>

          {!isValidLength ? (
            <div className="share-popover__length-warning" role="alert">
              <p>
                This piece is a bit long to share as a URL link — the PNG image export captures it perfectly!
              </p>
              {onExportPng ? (
                <button
                  type="button"
                  className="share-popover__btn share-popover__btn--primary"
                  onClick={() => {
                    onClose();
                    onExportPng();
                  }}
                >
                  Export as PNG Poster →
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="share-popover__url-box">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="share-popover__url-input"
                  aria-label="Shareable URL link"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  className={`share-popover__copy-btn ${copied ? "share-popover__copy-btn--copied" : ""}`}
                  onClick={handleCopyLink}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div className="share-popover__qr-section">
                <canvas
                  ref={canvasRef}
                  className="share-popover__qr-canvas"
                  aria-label={`QR Code encoding link: ${shareUrl}`}
                />
                <div className="share-popover__qr-info">
                  <span className="share-popover__qr-label">Scan QR to View</span>
                  <span className="share-popover__qr-sub">Instant read-only gallery artifact</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Toast
        open={!!toastMessage}
        message={toastMessage || ""}
        onDismiss={() => setToastMessage(null)}
      />
    </>
  );
}
