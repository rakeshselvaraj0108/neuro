"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSafeMode } from "@/hooks/useSafeMode";
import {
  clusterOrbPosition,
  generateStarField,
  orbRadiusFor,
} from "@/lib/constellation/layout";
import type { Cluster, Fragment } from "@/types/domain";

import { ClusterOrb } from "./ClusterOrb";
import { DetailPanel } from "./DetailPanel";
import { ParkedCaption } from "./ParkedCaption";

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 640;
const CENTER = { x: VIEWBOX_WIDTH / 2, y: 300 };
const ORBIT_RADIUS = Math.min(VIEWBOX_WIDTH, VIEWBOX_HEIGHT) * 0.34;
const STAR_COUNT = 72;

const STAR_FIELD = generateStarField(STAR_COUNT);

interface ConstellationMapProps {
  clusters: Cluster[];
  fragments: Fragment[];
  selectedClusterId: string | null;
  /** Non-null for the brief settle beat between commit and the crossfade away. */
  committingClusterId: string | null;
  onSelect: (id: string) => void;
  onCommit: (id: string) => void;
}

export function ConstellationMap({
  clusters,
  fragments,
  selectedClusterId,
  committingClusterId,
  onSelect,
  onCommit,
}: ConstellationMapProps) {
  const { isSafe } = useSafeMode();
  const reducedMotion = useReducedMotion();
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const gradientId = useId();

  const animateMotion = !isSafe && !reducedMotion;
  const isCommitting = committingClusterId !== null;

  const membersByClusterId = useMemo(() => {
    const map = new Map<string, Fragment[]>();
    const fragmentById = new Map(fragments.map((f) => [f.id, f] as const));
    clusters.forEach((cluster) => {
      map.set(
        cluster.id,
        cluster.fragmentIds
          .map((id) => fragmentById.get(id))
          .filter((f): f is Fragment => f !== undefined),
      );
    });
    return map;
  }, [clusters, fragments]);

  const activeClusterId = hoveredClusterId ?? selectedClusterId;
  const activeCluster = clusters.find((c) => c.id === activeClusterId) ?? null;

  const readinessSorted = [...clusters].sort((a, b) => b.readiness - a.readiness);

  return (
    <div className="constellation-map-wrap">
      <p className="constellation-hint">
        Tab to explore each idea. Press Enter to preview, Enter again to finish it.
      </p>

      <div className="constellation-map-stage">
        <svg
          className="constellation-map"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`A constellation of ${clusters.length} idea clusters from your flood`}
        >
          <defs>
            <radialGradient id={`${gradientId}-fill`} cx="35%" cy="32%" r="70%">
              <stop offset="0%" className="orb-stop orb-stop--bright" />
              <stop offset="55%" className="orb-stop orb-stop--deep" />
              <stop offset="100%" className="orb-stop orb-stop--deep-transparent" />
            </radialGradient>
            <radialGradient id={`${gradientId}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" className="orb-stop orb-stop--glow" />
              <stop offset="100%" className="orb-stop orb-stop--glow-transparent" />
            </radialGradient>
          </defs>

          <g aria-hidden="true" className="constellation-starfield">
            {STAR_FIELD.map((star, index) => (
              <circle
                key={index}
                cx={(star.x / 100) * VIEWBOX_WIDTH}
                cy={(star.y / 100) * VIEWBOX_HEIGHT}
                r={star.r}
                className="constellation-star"
                data-pulsing={animateMotion && star.pulses}
              />
            ))}
          </g>

          <g className="constellation-orbs" style={{ ["--orb-fill-url" as string]: `url(#${gradientId}-fill)`, ["--orb-glow-url" as string]: `url(#${gradientId}-glow)` }}>
            {clusters.map((cluster, index) => {
              const position = clusterOrbPosition(index, clusters.length, CENTER, ORBIT_RADIUS);
              const radius = orbRadiusFor(cluster.fragmentIds.length);
              const isParked = isCommitting && cluster.id !== committingClusterId;
              return (
                <ClusterOrb
                  key={cluster.id}
                  cluster={cluster}
                  members={membersByClusterId.get(cluster.id) ?? []}
                  position={position}
                  radius={radius}
                  isSelected={selectedClusterId === cluster.id}
                  isHovered={hoveredClusterId === cluster.id}
                  isParked={isParked}
                  animateMotion={animateMotion}
                  onHoverChange={(hovering) =>
                    setHoveredClusterId(hovering ? cluster.id : null)
                  }
                  onSelect={() => onSelect(cluster.id)}
                  onCommit={() => onCommit(cluster.id)}
                />
              );
            })}
          </g>
        </svg>

        <AnimatePresence>
          {activeCluster && !isCommitting ? (
            <DetailPanel
              key={activeCluster.id}
              cluster={activeCluster}
              members={membersByClusterId.get(activeCluster.id) ?? []}
              onCommit={() => onCommit(activeCluster.id)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {isCommitting ? <ParkedCaption otherCount={clusters.length - 1} /> : null}

      {/* Full non-visual parity for screen-reader users — not just "there is
          a picture here". Same readiness data, in readiness order. */}
      <ul className="sr-only" aria-label="Idea clusters, in order of readiness to finish">
        {readinessSorted.map((cluster) => {
          const members = membersByClusterId.get(cluster.id) ?? [];
          return (
            <li key={cluster.id}>
              {cluster.label}: {members.length} {members.length === 1 ? "idea" : "ideas"}, {cluster.readiness}
              % ready to finish. {cluster.readinessReason} Suggested forms: {cluster.suggestedForms.join(", ")}.
            </li>
          );
        })}
      </ul>
    </div>
  );
}
