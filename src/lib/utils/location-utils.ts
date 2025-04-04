// location-utils.ts
// Central utilities for handling location data across the application

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
  isCurrentLocation: boolean;
}

// Local cache to avoid redundant API calls
const geocodingCache = new Map<string, any>();

/**
 * Get the user's current location with optimized settings
 * @param options Additional geolocation options
 * @returns Promise with coordinates
 */
export async function getCurrentPosition(options: GeolocationOptions = {}): Promise<GeolocationPosition> {
  const defaultOptions = {
    enableHighAccuracy: true,  // Use GPS if available for better accuracy
    timeout: 10000,            // 10 seconds timeout to prevent long waits
    maximumAge: 60000          // Accept cached positions up to 1 minute old
  };
  
  const geolocationOptions = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    
    // Timer for faster feedback if geolocation is taking too long
    const timeoutId = setTimeout(() => {
      reject(new Error("Location detection timed out"));
    }, geolocationOptions.timeout + 1000); // Extra second for buffer
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      geolocationOptions
    );
  });
}

/**
 * Get location name from coordinates using reverse geocoding with caching
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Promise with location name
 */
export async function getLocationNameFromCoords(
  latitude: number, 
  longitude: number
): Promise<string> {
  // Round coordinates to 4 decimal places for caching
  const roundedLat = Math.round(latitude * 10000) / 10000;
  const roundedLon = Math.round(longitude * 10000) / 10000;
  const cacheKey = `${roundedLat},${roundedLon}`;
  
  // Check cache first
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey);
  }
  
  try {
    // Primary geocoding service - Open-Meteo
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location name');
    }
    
    const data = await response.json();
    let locationName;
    
    if (data.results && data.results.length > 0) {
      // Build location name with available admin areas
      const result = data.results[0];
      locationName = result.name;
      
      // Add administrative divisions if available, prioritizing smaller areas
      if (result.admin3) {
        locationName = `${locationName}, ${result.admin3}`;
      } else if (result.admin2) {
        locationName = `${locationName}, ${result.admin2}`;
      } else if (result.admin1) {
        locationName = `${locationName}, ${result.admin1}`;
      } else if (result.country) {
        locationName = `${locationName}, ${result.country}`;
      }
      
      // Cache the result
      geocodingCache.set(cacheKey, locationName);
      return locationName;
    }
    
    // Fallback to coordinates if no results
    locationName = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    geocodingCache.set(cacheKey, locationName);
    return locationName;
    
  } catch (error) {
    // Final fallback is just coordinates
    const fallbackName = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    return fallbackName;
  }
}

/**
 * Complete location detection workflow with optimized performance
 * @returns Promise with complete location data
 */
export async function detectUserLocation(): Promise<LocationData> {
  // Start with a loading state
  try {
    // Get geolocation with high accuracy but with timeout
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000  // Faster timeout for initial location
    });
    
    // Start geocoding as soon as we have coordinates
    const locationNamePromise = getLocationNameFromCoords(
      position.coords.latitude,
      position.coords.longitude
    );
    
    // Prepare location data with coordinates immediately
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      name: "Detecting...", // Temporary name while geocoding completes
      isCurrentLocation: true
    };
    
    // Store in local storage immediately (will update name later)
    if (localStorage.getItem('fg-weather-remember-location') === 'true') {
      localStorage.setItem('fg-weather-is-current-location', 'true');
      localStorage.setItem('fg-weather-coordinates', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));
    }
    
    // Complete with location name when available
    locationData.name = await locationNamePromise;
    
    // Update localStorage with name
    if (localStorage.getItem('fg-weather-remember-location') === 'true') {
      localStorage.setItem('fg-weather-location-name', locationData.name);
    }
    
    return locationData;
    
  } catch (error) {
    // If there's an error, fall back to default location
    console.error("Error detecting location:", error);
    throw error;
  }
}

/**
 * Load saved location from localStorage
 * @returns LocationData or null if no saved location
 */
export function getSavedLocation(): LocationData | null {
  const rememberLocation = localStorage.getItem('fg-weather-remember-location') === 'true';
  const savedCoords = localStorage.getItem('fg-weather-coordinates');
  const savedName = localStorage.getItem('fg-weather-location-name');
  
  if (rememberLocation && savedCoords && savedName) {
    try {
      const coords = JSON.parse(savedCoords);
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        name: savedName,
        isCurrentLocation: localStorage.getItem('fg-weather-is-current-location') === 'true'
      };
    } catch (e) {
      console.error("Error parsing saved location:", e);
    }
  }
  
  return null;
}

/**
 * Get default location when user location isn't available
 * @returns LocationData for Kuala Lumpur
 */
export function getDefaultLocation(): LocationData {
  return {
    latitude: 3.1390,
    longitude: 101.6869,
    name: "Kuala Lumpur, Malaysia",
    isCurrentLocation: false
  };
}

/**
 * Save location data to localStorage
 * @param locationData The location data to save
 */
export function saveLocationToStorage(locationData: LocationData): void {
  if (localStorage.getItem('fg-weather-remember-location') === 'true') {
    localStorage.setItem('fg-weather-is-current-location', locationData.isCurrentLocation.toString());
    localStorage.setItem('fg-weather-coordinates', JSON.stringify({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }));
    localStorage.setItem('fg-weather-location-name', locationData.name);
  }
}

/**
 * Create a React hook for location
 * This will help share location context across the app
 */
export const useLocationData = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function initializeLocation() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to load saved location first
        const savedLocation = getSavedLocation();
        
        if (savedLocation) {
          setLocationData(savedLocation);
          setIsLoading(false);
          
          // If it's not current location, try to get current in background
          if (!savedLocation.isCurrentLocation) {
            detectUserLocation()
              .then(currentLocationData => {
                // Update if we want to use current location
                setLocationData(currentLocationData);
                saveLocationToStorage(currentLocationData);
              })
              .catch(err => console.error("Background location detection failed:", err));
          }
        } else {
          // No saved location, try to get current
          const currentLocationData = await detectUserLocation();
          setLocationData(currentLocationData);
          saveLocationToStorage(currentLocationData);
        }
      } catch (err) {
        console.error("Failed to detect location:", err);
        setError(err as Error);
        
        // Fall back to default location
        const defaultLocation = getDefaultLocation();
        setLocationData(defaultLocation);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeLocation();
  }, []);
  
  // Function to manually update location
  const updateLocation = (newLocationData: LocationData) => {
    setLocationData(newLocationData);
    saveLocationToStorage(newLocationData);
  };
  
  // Force refresh current location
  const refreshCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const currentLocationData = await detectUserLocation();
      setLocationData(currentLocationData);
      saveLocationToStorage(currentLocationData);
      return currentLocationData;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    locationData,
    isLoading,
    error,
    updateLocation,
    refreshCurrentLocation
  };
};

// Add missing import
import { useState, useEffect } from 'react'; 