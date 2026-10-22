import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/electrical-to-focus102.json";
import { buildSteps, type RawInstruction } from "./steps";
import { buildProgress, fillFraction } from "./progress";

const steps = buildSteps({
  instructions: fixture.instructions as RawInstruction[],
  fromName: fixture.fromName,
  toName: fixture.toName,
  departureId: fixture.fromId,
  floorNames: fixture.floorNames,
  landmarks: fixture.landmarks,
});

describe("buildProgress", () => {
  const nodes = buildProgress(steps);

  it("has a start ring, an end pin and a stairs icon in between", () => {
    expect(nodes[0]).toMatchObject({ kind: "start", position: 0 });
    expect(nodes[nodes.length - 1]).toMatchObject({ kind: "end", position: 1 });
    const connection = nodes.filter((n) => n.kind === "connection");
    expect(connection).toHaveLength(1);
    expect(connection[0].connectionType).toBe("stairs");
  });

  it("places nodes by distance, in order", () => {
    nodes.slice(1).forEach((node, i) => expect(node.position).toBeGreaterThanOrEqual(nodes[i].position));
    // The stairs are about two thirds of the way along this 42 m route.
    const stairs = nodes.find((n) => n.kind === "connection")!;
    expect(stairs.position).toBeGreaterThan(0.6);
    expect(stairs.position).toBeLessThan(0.8);
  });
});

describe("fillFraction", () => {
  it("is empty in overview and full on arrival", () => {
    expect(fillFraction(steps, null)).toBe(0);
    expect(fillFraction(steps, 0)).toBe(0);
    expect(fillFraction(steps, steps.length - 1)).toBe(1);
  });
});
