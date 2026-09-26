const EARTH_RADIUS_M = 6_371_000;

/** Jarak great-circle (haversine) dalam meter. */
export function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  return m < 1000
    ? `${Math.round(m)} m`
    : `${(m / 1000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} km`;
}
