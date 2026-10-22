import { describe, expect, it } from "vitest";
import { esc, floorShortLabel, stripEmoji } from "./text";
import { bearingDeg, distanceM, turnAngle } from "./geo";

describe("esc", () => {
  it("escapes HTML-significant characters", () => {
    expect(esc(`<img src=x onerror="alert('x')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });
});

describe("stripEmoji", () => {
  it.each([
    ["Electrical Room ⚡️", "Electrical Room"],
    ["Women's Washroom 🚻", "Women's Washroom"],
    ["Custodial 🛠️", "Custodial"],
    ["Huddle 105 💡 ", "Huddle 105"],
    ["Spruce Meeting Room ", "Spruce Meeting Room"],
    ["Yew Meeting Room", "Yew Meeting Room"],
  ])("%s → %s", (input, expected) => {
    expect(stripEmoji(input)).toBe(expected);
  });
});

describe("floorShortLabel", () => {
  it("derives L1/L2 from 'Level N' when shortName is unhelpful", () => {
    expect(floorShortLabel("Level 1", "Level 1")).toBe("L1");
    expect(floorShortLabel("Level 12", undefined)).toBe("L12");
  });
  it("uses a real short name when the map provides one", () => {
    expect(floorShortLabel("Upper Ground Floor", "UGF")).toBe("UGF");
  });
  it("falls back to initials", () => {
    expect(floorShortLabel("First Floor", "First Floor")).toBe("FF");
    expect(floorShortLabel("GF", "GF")).toBe("GF");
  });
});

describe("geo", () => {
  const a = { lat: 43.97386, lng: -78.1620611 };
  it("measures short indoor distances", () => {
    const b = { lat: 43.9738557, lng: -78.162059 };
    expect(distanceM(a, b)).toBeCloseTo(0.51, 1); // SDK reports 0.5103 m
  });
  it("gives compass bearings", () => {
    expect(bearingDeg(a, { lat: a.lat + 0.001, lng: a.lng })).toBeCloseTo(0, 1);
    expect(bearingDeg(a, { lat: a.lat, lng: a.lng + 0.001 })).toBeCloseTo(90, 0);
  });
  it("normalises turn angles to (-180, 180]", () => {
    expect(turnAngle(350, 10)).toBe(20);
    expect(turnAngle(10, 350)).toBe(-20);
    expect(turnAngle(0, 180)).toBe(180);
    expect(turnAngle(90, 0)).toBe(-90);
  });
});
