import { Injectable } from "@nestjs/common";

export interface LatLng {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeoService {
  /**
   * Calculate the great-circle distance between two points on Earth
   * using the Haversine formula.
   *
   * @param a - First point (latitude, longitude)
   * @param b - Second point (latitude, longitude)
   * @returns Distance in kilometers
   */
  haversineKm(a: LatLng, b: LatLng): number {
    const R = 6371; // Earth's radius in kilometers

    const dLat = this.toRad(b.latitude - a.latitude);
    const dLon = this.toRad(b.longitude - a.longitude);

    const lat1 = this.toRad(a.latitude);
    const lat2 = this.toRad(b.latitude);

    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
