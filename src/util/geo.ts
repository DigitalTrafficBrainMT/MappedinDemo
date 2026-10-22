export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Equirectangular approximation — accurate to well under a centimetre at
// indoor scales, and much cheaper than haversine.
export function distanceM(a: LatLng, b: LatLng): number {
  const x = toRad(b.lng - a.lng) * Math.cos(toRad((a.lat + b.lat) / 2));
  const y = toRad(b.lat - a.lat);
  return Math.hypot(x, y) * EARTH_RADIUS_M;
}

// Compass bearing, degrees clockwise from North, in [0, 360).
export function bearingDeg(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Signed turn from heading `a` to heading `b`, in (-180, 180]. Positive is
// a right (clockwise) turn.
export function turnAngle(a: number, b: number): number {
  let delta = (b - a) % 360;
  if (delta > 180) delta -= 360;
  if (delta <= -180) delta += 360;
  return delta;
}
