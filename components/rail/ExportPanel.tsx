"use client";

import { DownloadIcon } from "@/components/icons/DownloadIcon";
import { FileTextIcon } from "@/components/icons/FileTextIcon";
import { ImageIcon } from "@/components/icons/ImageIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { IconTile } from "@/components/ui/IconTile";
import { Panel } from "@/components/ui/Panel";

interface ExportRowConfig {
  key: string;
  name: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number }>;
}

const ROWS: ExportRowConfig[] = [
  { key: "png", name: "PNG Image", sublabel: "High Quality", icon: ImageIcon },
  { key: "pdf", name: "PDF File", sublabel: "Print Ready", icon: FileTextIcon },
  { key: "share", name: "Share Card", sublabel: "Share Anywhere", icon: ShareIcon },
];

/**
 * "Export Your Piece": three real, focusable buttons with complete hover,
 * active and focus-visible states. They intentionally do nothing yet — export
 * is wired to real output in Phase 9 — but they must not be `disabled`, or a
 * keyboard-only pass could never reach them.
 */
export function ExportPanel() {
  return (
    <Panel label="Export Your Piece" labelId="export-heading">
      <div className="export" role="group" aria-labelledby="export-heading">
        {ROWS.map((row) => (
          <button key={row.key} type="button" className="export__row">
            <IconTile>
              <row.icon size={15} />
            </IconTile>
            <span>
              <span className="export__name">{row.name}</span>
              <span className="export__sub">{row.sublabel}</span>
            </span>
            <span className="export__trail">
              <DownloadIcon size={13} />
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
