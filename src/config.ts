// Mappedin's public demo keys for the "Office Demo" map. Fine to ship to the
// browser because they're demo-only; a real venue's secret must not be.
export const MAPPEDIN_OPTIONS = {
  key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
  secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
  mapId: "64ef49e662fd90fe020bee61",
};

// Average indoor walking speed, used for "2 minutes total" style estimates
// (the SDK only gives metres).
export const WALK_SPEED_MPS = 1.4;

// Step consolidation (ADR-003). Turns closer together than this collapse
// into one step; the SDK reports lots of 0–2 m wiggles.
export const MERGE_DISTANCE_M = 3;
// Net heading change thresholds, in degrees.
export const ANGLE_STRAIGHT = 25;
export const ANGLE_SLIGHT = 60;
export const ANGLE_TURN = 150;

// Landmarks for "Turn right at X": nearest named room centre within this
// radius, excluding utility rooms nobody navigates by.
export const LANDMARK_RADIUS_M = 5;
export const LANDMARK_EXCLUDE = /storage|electrical|custodial/i;

// Route colours (ADR-002). Observed from the Battersea reference; WebGL
// pixels can't be measured, so these are tuned by eye.
export const ROUTE_COLOR = "#4C82FF";
export const ROUTE_ACTIVE_COLOR = "#1A2C9E";

// Battersea draws the route as a flat line with straight runs and rounded
// corners. The SDK's default "tube" geometry is 3D (visible side faces and
// angled seams), so use a flat ribbon with CatmullRom corner smoothing.
// Tension above ~0.3 overshoots where route points sit close together
// (doorways), producing S-shaped wobbles.
export const ROUTE_SHAPE = {
  geometry: "ribbon" as const,
  /** Metres, so the line scales with zoom like Battersea's. */
  width: 1.2,
  // Mappedin's guidance: tension 0.1–0.3 with the default 0.5 m corner radius.
  // Larger radii overlap on short legs and show seams in the bends.
  smoothing: { tension: 0.2, cornerRadius: 0.5 },
  border: { enabled: true, color: "darken", width: 0.12 },
};
/** Direction arrows on the current leg. */
export const ROUTE_ARROW_COLOR = "#FFFFFF";

// Camera presets (spec §6). Bearing is always the venue's own default.
export const CAMERA = {
  stepPitch: 10,
  overviewPitch: 45,
  locationPitch: 0,
  maxZoomLevel: 21,
  stepDuration: 700,
  connectionDuration: 900,
  highlightDuration: 350,
};

export const MOBILE_QUERY = "(max-width: 768px)";
