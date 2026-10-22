// Turns a route polyline into Battersea-style "pipework": straight runs
// along the building's two main axes, meeting at right-angle corners (which
// the renderer then rounds). The SDK's raw route points zig-zag slightly
// inside corridors, and corner smoothing alone turns that into wobbles.
// Pure: works in local metres, no SDK.

export interface XY {
  x: number;
  y: number;
}

/** A run shorter than this between two parallel runs is a jog, not a turn. */
const JOG_M = 1.5;

type Axis = "H" | "V";
interface Run {
  axis: Axis;
  points: XY[]; // the original points this run covers (in rotated space)
}

const rotate = (p: XY, a: number): XY => ({
  x: p.x * Math.cos(a) - p.y * Math.sin(a),
  y: p.x * Math.sin(a) + p.y * Math.cos(a),
});

const len = (a: XY, b: XY) => Math.hypot(b.x - a.x, b.y - a.y);

/**
 * The building's grid angle, from the route itself: the length-weighted
 * average direction of its segments, folded to a 90° period so north–south
 * and east–west corridors agree.
 */
export function dominantAngle(points: XY[]): number {
  let c = 0;
  let s = 0;
  for (let i = 1; i < points.length; i++) {
    const w = len(points[i - 1], points[i]);
    const a = Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x);
    c += w * Math.cos(4 * a);
    s += w * Math.sin(4 * a);
  }
  return Math.atan2(s, c) / 4;
}

export function straighten(input: XY[]): XY[] {
  const points = input.filter((p, i) => i === 0 || len(input[i - 1], p) > 0.05);
  if (points.length < 3) return points;

  const angle = dominantAngle(points);
  const local = points.map((p) => rotate(p, -angle));

  // Each segment belongs to whichever axis it runs closest to.
  let runs: Run[] = [];
  for (let i = 1; i < local.length; i++) {
    const a = local[i - 1];
    const b = local[i];
    const axis: Axis = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? "H" : "V";
    const last = runs[runs.length - 1];
    if (last && last.axis === axis) last.points.push(b);
    else runs.push({ axis, points: [a, b] });
  }

  // Absorb short jogs between two parallel runs (H, short V, H → one H).
  let changed = true;
  while (changed && runs.length > 2) {
    changed = false;
    for (let i = 1; i < runs.length - 1; i++) {
      const run = runs[i];
      const span = len(run.points[0], run.points[run.points.length - 1]);
      if (span < JOG_M && runs[i - 1].axis === runs[i + 1].axis) {
        const merged: Run = {
          axis: runs[i - 1].axis,
          points: [...runs[i - 1].points, ...run.points.slice(1), ...runs[i + 1].points.slice(1)],
        };
        runs = [...runs.slice(0, i - 1), merged, ...runs.slice(i + 2)];
        changed = true;
        break;
      }
    }
  }

  const start = local[0];
  const end = local[local.length - 1];
  if (runs.length === 1) return [points[0], points[points.length - 1]];

  // Each run is a line at a fixed cross-coordinate. The first and last runs
  // pass exactly through the route's ends; inner runs sit at the
  // length-weighted middle of the points they replace.
  const fixed = runs.map((run, i) => {
    const key = run.axis === "H" ? "y" : "x";
    if (i === 0) return start[key];
    if (i === runs.length - 1) return end[key];
    let total = 0;
    let sum = 0;
    for (let k = 1; k < run.points.length; k++) {
      const w = len(run.points[k - 1], run.points[k]) || 1e-6;
      total += w;
      sum += w * (run.points[k - 1][key] + run.points[k][key]) / 2;
    }
    return sum / total;
  });

  // Consecutive runs alternate axes, so each corner is their intersection.
  const out: XY[] = [start];
  for (let i = 0; i < runs.length - 1; i++) {
    out.push(runs[i].axis === "H" ? { x: fixed[i + 1], y: fixed[i] } : { x: fixed[i], y: fixed[i + 1] });
  }
  out.push(end);
  return out.map((p) => rotate(p, angle));
}

/** Arc-length position of the point on `line` nearest to `p`. */
export function project(line: XY[], p: XY): number {
  let best = Infinity;
  let bestS = 0;
  let s = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const l = len(a, b);
    const t = l === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (l * l)));
    const q = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    const d = len(p, q);
    if (d < best) {
      best = d;
      bestS = s + t * l;
    }
    s += l;
  }
  return bestS;
}

/** The part of `line` between arc lengths `from` and `to`. */
export function slice(line: XY[], from: number, to: number): XY[] {
  const [s0, s1] = from <= to ? [from, to] : [to, from];
  const out: XY[] = [];
  let s = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const l = len(a, b);
    const at = (target: number) => {
      const t = l === 0 ? 0 : (target - s) / l;
      return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    };
    if (s + l >= s0 && s <= s1) {
      if (!out.length) out.push(s0 >= s ? at(s0) : a);
      if (s1 <= s + l) {
        out.push(at(s1));
        break;
      }
      out.push(b);
    }
    s += l;
  }
  return out;
}
