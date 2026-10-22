import { describe, expect, it } from "vitest";
import { project, slice, straighten, type XY } from "./straighten";

const close = (a: XY, b: XY) => {
  expect(a.x).toBeCloseTo(b.x, 6);
  expect(a.y).toBeCloseTo(b.y, 6);
};

// True when every corner is exactly 90° — pipework, whatever the grid angle.
const isRectilinear = (line: XY[], _angle = 0) =>
  line.slice(2).every((c, i) => {
    const a = line[i];
    const b = line[i + 1];
    const dot = (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y);
    return Math.abs(dot) < 1e-6 * Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(c.x - b.x, c.y - b.y);
  });

describe("straighten", () => {
  it("turns a wobbly corridor walk into straight runs with a right-angle corner", () => {
    const wobbly: XY[] = [
      { x: 0, y: 0 },
      { x: 5, y: 0.3 },
      { x: 10, y: -0.2 },
      { x: 15, y: 0.1 }, // corner
      { x: 15.4, y: 5 },
      { x: 14.8, y: 10 },
    ];
    const out = straighten(wobbly);
    expect(isRectilinear(out)).toBe(true);
    expect(out).toHaveLength(3);
    close(out[0], wobbly[0]); // ends never move
    close(out[out.length - 1], wobbly[wobbly.length - 1]);
  });

  it("absorbs a short sideways jog between two parallel runs", () => {
    const jog: XY[] = [
      { x: 0, y: 0 },
      { x: 8, y: 0 },
      { x: 8.2, y: 0.8 }, // 0.8 m jog
      { x: 16, y: 0.8 },
      { x: 16, y: 10 },
    ];
    const out = straighten(jog);
    expect(out).toHaveLength(3); // H run, corner, V run
    expect(isRectilinear(out)).toBe(true);
  });

  it("follows a building that isn't north-aligned", () => {
    const a = (30 * Math.PI) / 180;
    const r = (p: XY): XY => ({ x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) });
    const route = [{ x: 0, y: 0 }, { x: 10, y: 0.4 }, { x: 10.3, y: 8 }].map(r);
    expect(isRectilinear(straighten(route), a)).toBe(true);
  });
});

describe("project / slice", () => {
  const line: XY[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
  it("measures arc length to the nearest point", () => {
    expect(project(line, { x: 4, y: 1 })).toBeCloseTo(4);
    expect(project(line, { x: 11, y: 3 })).toBeCloseTo(13);
  });
  it("cuts out the stretch between two arc lengths, keeping the corner", () => {
    const part = slice(line, 5, 15);
    expect(part).toHaveLength(3);
    close(part[0], { x: 5, y: 0 });
    close(part[1], { x: 10, y: 0 });
    close(part[2], { x: 10, y: 5 });
  });
});

describe("straighten with a known building grid", () => {
  it("aligns runs to the given grid angle, not the route's own drift", () => {
    // Route drifts ~4° but the building is axis-aligned (angle 0).
    const route: XY[] = [{ x: 0, y: 0 }, { x: 10, y: 0.7 }, { x: 10.7, y: 10 }];
    const out = straighten(route, 0);
    // Middle corner shares x with the end and y with the start: true axis lines.
    expect(out[1].y).toBeCloseTo(0, 6);
    expect(out[1].x).toBeCloseTo(10.7, 6);
  });
});
