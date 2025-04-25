/**
 * Utility functions for location-related calculations
 */

import { Location } from '../types';

/**
 * Calculate the distance between two locations in kilometers
 * Uses the Haversine formula
 */
export const calculateDistance = (
  location1: { latitude: number; longitude: number },
  location2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(location2.latitude - location1.latitude);
  const dLon = toRad(location2.longitude - location1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(location1.latitude)) *
      Math.cos(toRad(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculate estimated time of arrival in minutes
 * @param distance Distance in kilometers
 * @param speed Speed in km/h (defaults to 30 km/h for urban travel)
 */
export const calculateETA = (distance: number, speed = 30): number => {
  // Convert speed from km/h to km/minute
  const speedInKmPerMinute = speed / 60;
  // Calculate time in minutes
  return distance / speedInKmPerMinute;
};

/**
 * Format the estimated time of arrival into a human-readable string
 * @param etaMinutes ETA in minutes
 */
export const formatETA = (etaMinutes: number): string => {
  if (etaMinutes < 1) {
    return 'Less than a minute';
  }
  
  if (etaMinutes < 60) {
    const minutes = Math.round(etaMinutes);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(etaMinutes / 60);
  const minutes = Math.round(etaMinutes % 60);
  
  let result = `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (minutes > 0) {
    result += ` ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return result;
};

/**
 * Get a formatted address from coordinates using reverse geocoding
 * This is a placeholder - in a production app, you would use a geocoding service
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  // Placeholder - in a real app, you would implement reverse geocoding
  // using Google Maps Geocoding API, Mapbox, or another service
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};
