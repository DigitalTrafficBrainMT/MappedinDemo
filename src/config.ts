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
export const ROUTE_COLOR = "#3D6EFF";
export const ROUTE_ACTIVE_COLOR = "#1F3CB8";

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
