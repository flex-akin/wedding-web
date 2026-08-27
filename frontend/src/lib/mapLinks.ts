export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function appleMapsUrl(lat: number, lng: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}

export function wazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

export function embedMapUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}
