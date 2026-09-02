import { Region, IRegion } from '../models/Region.js';

export class LocationService {
  /**
   * Validate latitude and longitude values
   */
  public static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Reverse geocode coordinates to City, State, Country via OpenStreetMap Nominatim
   */
  public static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ city: string; state: string; country: string }> {
    if (!LocationService.validateCoordinates(latitude, longitude)) {
      throw new Error('Invalid geographic coordinates. Latitude must be -90 to +90 and Longitude -180 to +180.');
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NutriRegionApp/1.0 (contact@nutriregion.com)',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};

        const city =
          address.city ||
          address.town ||
          address.village ||
          address.suburb ||
          address.county ||
          address.state_district ||
          'Unknown City';

        const state = address.state || address.region || 'Unknown State';
        const country = address.country || 'India';

        return { city, state, country };
      }
    } catch (err) {
      console.warn('Reverse geocoding service network call failed, falling back to proximity matching:', err);
    }

    return { city: '', state: '', country: 'India' };
  }

  /**
   * Reverse geocode coordinates to City, State, Country and match NutriRegion hub
   */
  public static async matchRegionFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<{
    matchedRegion: IRegion;
    detectedCity: string;
    detectedState: string;
    detectedCountry: string;
    distanceKm: number;
  }> {
    if (!LocationService.validateCoordinates(latitude, longitude)) {
      throw new Error('Invalid coordinates. Latitude must be -90 to +90 and Longitude -180 to +180.');
    }

    // 1. Attempt reverse geocoding first
    const geoData = await LocationService.reverseGeocode(latitude, longitude);

    // 2. Fetch all active regions from MongoDB
    const regions = await Region.find({ isActive: true });

    if (regions.length === 0) {
      throw new Error('No active regional hubs found in database.');
    }

    // 3. Check for exact or partial city/state match in existing regions
    let matchedByCityState: IRegion | null = null;
    if (geoData.city) {
      const searchCity = geoData.city.toLowerCase();
      const searchState = geoData.state.toLowerCase();

      matchedByCityState =
        regions.find(
          (r) => r.city.toLowerCase() === searchCity || searchCity.includes(r.city.toLowerCase())
        ) ||
        regions.find(
          (r) => r.state.toLowerCase() === searchState || searchState.includes(r.state.toLowerCase())
        ) ||
        null;
    }

    // 4. Calculate nearest region using Haversine formula
    let closestRegion = regions[0];
    let minDistance = Infinity;

    for (const region of regions) {
      const regionLng = region.centerLocation?.coordinates[0] ?? 73.8567;
      const regionLat = region.centerLocation?.coordinates[1] ?? 18.5204;

      const dist = LocationService.haversineDistance(latitude, longitude, regionLat, regionLng);
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = region;
      }
    }

    // Use city/state match if within reasonable distance or default to closest region
    const finalRegion = matchedByCityState || closestRegion;
    const finalCity = geoData.city || finalRegion.city;
    const finalState = geoData.state || finalRegion.state;
    const finalCountry = geoData.country || finalRegion.country;

    return {
      matchedRegion: finalRegion,
      detectedCity: finalCity,
      detectedState: finalState,
      detectedCountry: finalCountry,
      distanceKm: Math.round(minDistance * 10) / 10,
    };
  }

  /**
   * Calculate distance between two coordinates in kilometers using Haversine formula
   */
  public static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

