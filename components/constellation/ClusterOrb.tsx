"use client";

import { motion } from "framer-motion";

import { MicIcon } from "@/components/icons/MicIcon";
import {
  breatheDurationFor,
  fragmentDotPosition,
  type Point,
} from "@/lib/constellation/layout";
import type { Cluster, Fragment } from "@/types/domain";

import { FragmentDot } from "./FragmentDot";

const EASE = [0.22, 1, 0.36, 1] as const;
const DOT_ORBIT_OFFSET = 24;
const HIGH_READINESS_THRESHOLD = 60;

interface ClusterOrbProps {
  cluster: Cluster;
  members: Fragment[];
  position: Point;
  radius: number;
  isSelected: boolean;
  isHovered: boolean;
  /** True for every non-committed orb once the creator commits to a different one. */
  isParked: boolean;
  animateMotion: boolean;
  onHoverChange: (hovering: boolean) => void;
  onSelect: () => void;
  onCommit: () => void;
}

/**
 * One cluster, rendered as a glowing orb with its fragments orbiting it on
 * thin constellation lines. Size communicates fragment count; breathing
 * speed communicates readiness — both independent of the % label, so the
 * information survives even with color vision differences or Safe Mode's
 * flattened palette.
 */
export function ClusterOrb({
  cluster,
  members,
  position,
  radius,
  isSelected,
  isHovered,
  isParked,
  animateMotion,
  onHoverChange,
  onSelect,
  onCommit,
}: ClusterOrbProps) {
  const isActive = isSelected || isHovered;
  const hasVoiceMember = members.some((fragment) => fragment.mode === "voice");
  const isHighReadiness = cluster.readiness >= HIGH_READINESS_THRESHOLD;
  const shouldBreathe = animateMotion && !isParked;
  const breatheDuration = breatheDurationFor(cluster.readiness);

  const handleKeyDown = (event: React.KeyboardEvent<SVGGElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    // A second Enter on an already-selected, focused orb commits directly —
    // documented via the visible hint in ConstellationMap, not a hidden trick.
    if (isSelected) onCommit();
    else onSelect();
  };

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={`Cluster: ${cluster.label}, ${members.length} ${members.length === 1 ? "idea" : "ideas"}, ${cluster.readiness} percent ready to finish`}
      aria-pressed={isSelected}
      className="cluster-orb"
      style={{ transformOrigin: `${position.x}px ${position.y}px` }}
      initial={animateMotion ? { opacity: 0, scale: 0.7 } : { opacity: 1, scale: 1 }}
      animate={{
        opacity: 1,
        scale: isParked ? 0.82 : isActive ? 1.06 : 1,
      }}
      transition={{ duration: 0.4, ease: EASE }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {members.map((fragment, index) => (
        <FragmentDot
          key={fragment.id}
          position={fragmentDotPosition(index, members.length, position, radius + DOT_ORBIT_OFFSET)}
          orbCenter={position}
          emphasized={isActive}
        />
      ))}

      <circle
        className="cluster-orb__glow"
        cx={position.x}
        cy={position.y}
        r={radius * 1.5}
        data-breathing={shouldBreathe}
        style={{ animationDuration: `${breatheDuration}s` }}
      />

      <circle
        className="cluster-orb__fill"
        cx={position.x}
        cy={position.y}
        r={radius}
        data-active={isActive}
      />
      <circle
        className="cluster-orb__parked-overlay"
        cx={position.x}
        cy={position.y}
        r={radius}
        data-parked={isParked}
      />

      {hasVoiceMember ? (
        <svg
          x={position.x + radius * 0.62}
          y={position.y - radius * 0.62 - 11}
          width={11}
          height={11}
          aria-hidden="true"
        >
          <MicIcon size={11} className="cluster-orb__mode-glyph" />
        </svg>
      ) : null}

      <text
        x={position.x}
        y={position.y + radius + 20}
        textAnchor="middle"
        className="cluster-orb__label"
      >
        {cluster.label}
      </text>
      <text
        x={position.x}
        y={position.y + radius + 36}
        textAnchor="middle"
        className={
          isHighReadiness ? "cluster-orb__readiness cluster-orb__readiness--high" : "cluster-orb__readiness"
        }
      >
        {cluster.readiness}% ready
      </text>
    </motion.g>
  );
}
