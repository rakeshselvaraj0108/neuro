import { toBlob, toPng } from "html-to-image";
import jsPDF from "jspdf";

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "finished-piece";
}

/**
 * Preloads fonts to ensure html-to-image embeds real Cinzel and Cormorant typefaces.
 */
async function preloadWebFonts(): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font loading errors gracefully
    }
  }
}

/**
 * Renders an export target node to a crisp 2x PNG Blob and triggers browser download / OS share.
 */
export async function exportPieceAsPng(
  node: HTMLElement,
  title: string,
): Promise<Blob> {
  await preloadWebFonts();

  const blob = await toBlob(node, {
    pixelRatio: 2,
    quality: 0.95,
    cacheBust: true,
  });

  if (!blob) {
    throw new Error("Failed to render canvas image Blob");
  }

  const filename = `${slugifyTitle(title)}.png`;

  // Try Native OS Web Share API first if supported
  if (typeof navigator !== "undefined" && "canShare" in navigator) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: `Finished piece: "${title}"`,
          files: [file],
        });
        return blob;
      }
    } catch {
      // Fall back to direct file download
    }
  }

  // Direct Browser Download
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);

  return blob;
}

/**
 * Renders an export target node to a high-res PNG and embeds it into a print-ready A4 PDF.
 */
export async function exportPieceAsPdf(
  node: HTMLElement,
  title: string,
): Promise<void> {
  await preloadWebFonts();

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      quality: 0.95,
      cacheBust: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1200x1500 is 4:5 aspect ratio
    const margin = 15;
    const printWidth = pageWidth - margin * 2;
    const printHeight = printWidth * 1.25;

    const yPos = Math.max(margin, (pageHeight - printHeight) / 2);

    pdf.addImage(dataUrl, "PNG", margin, yPos, printWidth, printHeight);

    const filename = `${slugifyTitle(title)}.pdf`;
    pdf.save(filename);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("jsPDF export failed, falling back to window.print()", err);
    if (typeof window !== "undefined") {
      window.print();
    }
  }
}
