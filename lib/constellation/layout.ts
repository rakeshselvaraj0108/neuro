/**
 * Pure trigonometric layout for the constellation map — no physics
 * simulation, no randomness at render time. Every position is a
 * deterministic function of (index, count), so the same cluster set always
 * lays out identically and is trivially unit-testable.
 */

export interface Point {
  x: number;
  y: number;
}

const TAU = Math.PI * 2;

/** Angle for item `index` of `count`, starting at 12 o'clock, going clockwise. */
export function angleFor(index: number, count: number): number {
  if (count <= 0) return -Math.PI / 2;
  return (TAU / count) * index - Math.PI / 2;
}

export function pointOnCircle(center: Point, radius: number, angle: number): Point {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

/** Where cluster orb `index` (of `count`) sits, orbiting `center` at `orbitRadius`. */
export function clusterOrbPosition(
  index: number,
  count: number,
  center: Point,
  orbitRadius: number,
): Point {
  if (count <= 1) return center;
  return pointOnCircle(center, orbitRadius, angleFor(index, count));
}

/** Where fragment dot `index` (of `count`, within one cluster) sits around its orb. */
export function fragmentDotPosition(
  index: number,
  count: number,
  orbCenter: Point,
  dotOrbitRadius: number,
): Point {
  if (count <= 1) return pointOnCircle(orbCenter, dotOrbitRadius, -Math.PI / 2);
  return pointOnCircle(orbCenter, dotOrbitRadius, angleFor(index, count));
}

const ORB_BASE_RADIUS = 26;
const ORB_SCALE = 10;

/** Orb size communicates cluster size at a glance: base + sqrt(count) * scale. */
export function orbRadiusFor(fragmentCount: number): number {
  return ORB_BASE_RADIUS + Math.sqrt(Math.max(fragmentCount, 0)) * ORB_SCALE;
}

const BREATHE_MAX_DURATION_S = 5;
const BREATHE_MIN_DURATION_S = 1.8;

/**
 * Breathing-cycle duration, inversely proportional to readiness — the
 * closest-to-finished cluster visibly breathes fastest. This is the same
 * class of Phase 1/3 motion-law exception as the voice mic's breathing glow:
 * functional information design, not decoration. Do not "fix" it to a flat
 * duration in a later motion-law pass.
 */
export function breatheDurationFor(readiness: number): number {
  const clamped = Math.min(Math.max(readiness, 0), 100);
  return BREATHE_MAX_DURATION_S - (clamped / 100) * (BREATHE_MAX_DURATION_S - BREATHE_MIN_DURATION_S);
}

// ---------------------------------------------------------------------------
// Star field — seeded, not Math.random(), so it never re-shuffles on re-render.
// ---------------------------------------------------------------------------

export interface Star {
  /** Percentage position, 0-100, within the canvas. */
  x: number;
  y: number;
  r: number;
  pulses: boolean;
}

/** mulberry32 — compact, deterministic, no external dependency. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_FIELD_SEED = 20260214;
/** Exactly these three stars pulse — fixed indices, not a fraction of `count`. */
const PULSING_STAR_INDICES = new Set([7, 23, 51]);

export function generateStarField(count: number): Star[] {
  const rand = mulberry32(STAR_FIELD_SEED);
  const stars: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      r: 1 + rand(),
      pulses: PULSING_STAR_INDICES.has(i),
    });
  }
  return stars;
}
