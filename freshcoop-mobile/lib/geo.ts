// Coordonnées approximatives des régions du Sénégal
export const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  Dakar: { lat: 14.7167, lng: -17.4677 },
  Thiès: { lat: 14.7886, lng: -16.9246 },
  Kaolack: { lat: 14.1825, lng: -16.2533 },
  Fatick: { lat: 14.3372, lng: -16.4155 },
  'Saint-Louis': { lat: 16.0174, lng: -16.4897 },
  Diourbel: { lat: 14.6539, lng: -16.2334 },
  Louga: { lat: 15.6191, lng: -16.2308 },
  Ziguinchor: { lat: 12.5833, lng: -16.2667 },
  Tambacounda: { lat: 13.7708, lng: -13.6673 },
  Matam: { lat: 15.6559, lng: -13.2558 },
};

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
