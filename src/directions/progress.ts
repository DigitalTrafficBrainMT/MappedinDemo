// Progress bar model, matching Battersea: a ring at the start, a pin at the
// end, an icon for each floor change and small dots for ordinary steps —
// placed by distance along the route rather than evenly. Pure.
import type { Step } from "./steps";

export type ProgressNodeKind = "start" | "end" | "connection" | "dot";

export interface ProgressNode {
  /** Index into the steps array. */
  index: number;
  kind: ProgressNodeKind;
  connectionType?: string;
  /** 0–1 along the bar. */
  position: number;
}

function totalOf(steps: Step[]): number {
  return steps.length ? steps[steps.length - 1].cumulative : 0;
}

/** A dot closer than this (fraction of the bar) to an icon would sit under it. */
const DOT_CLEARANCE = 0.11;

function allNodes(steps: Step[]): ProgressNode[] {
  const total = totalOf(steps);
  return steps.map((step, index) => {
    const position = index === 0 ? 0 : index === steps.length - 1 || total === 0 ? 1 : step.cumulative / total;
    let kind: ProgressNodeKind = "dot";
    if (index === 0) kind = "start";
    else if (index === steps.length - 1) kind = "end";
    else if (step.kind === "take-connection") kind = "connection";
    return { index, kind, connectionType: step.connectionType, position } as ProgressNode;
  });
}

export function buildProgress(steps: Step[]): ProgressNode[] {
  const all = allNodes(steps);
  // Icons win over dots: a dot next to the start ring, stairs icon or end pin
  // only gets in the way (it was peeking out from under the end pin).
  const icons = all.filter((n) => n.kind !== "dot");
  return all.filter((n) => n.kind !== "dot" || icons.every((i) => Math.abs(i.position - n.position) >= DOT_CLEARANCE));
}

/** How far the fill reaches with `current` as the active step (null = overview). */
export function fillFraction(steps: Step[], current: number | null): number {
  if (current === null || steps.length === 0) return 0;
  const nodes = allNodes(steps); // every step, including hidden dots
  return nodes[Math.min(Math.max(current, 0), nodes.length - 1)].position;
}
