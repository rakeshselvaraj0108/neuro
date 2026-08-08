"use client";

import type { Fragment } from "@/types/domain";

import { FragmentCard } from "./FragmentCard";

interface FloodCanvasProps {
  fragments: Fragment[];
  onRemove: (id: string) => void;
  /** While false, the persisted fragments haven't been read back yet — render nothing rather than a misleading empty state. */
  hydrated: boolean;
}

/**
 * Where captured fragments live — deliberately not a tidy list. A CSS
 * multi-column layout (not a JS masonry library) settles cards at different
 * heights, which is exactly what makes it read as a flood rather than a form.
 */
export function FloodCanvas({ fragments, onRemove, hydrated }: FloodCanvasProps) {
  if (!hydrated) return <div className="flood-canvas flood-canvas--pending" aria-hidden="true" />;

  if (fragments.length === 0) {
    return (
      <div className="flood-canvas flood-canvas--empty">
        <p className="flood-canvas__empty-copy">
          Nothing caught yet. Say whatever&rsquo;s loudest right now.
        </p>
      </div>
    );
  }

  return (
    <div className="flood-canvas">
      {fragments.map((fragment) => (
        <FragmentCard key={fragment.id} fragment={fragment} onRemove={onRemove} />
      ))}
    </div>
  );
}
