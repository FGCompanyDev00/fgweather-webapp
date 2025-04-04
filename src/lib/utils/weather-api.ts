import axios from "axios";
import { toast } from "sonner";

// Constants
const BASE_URL = "https://api.open-meteo.com/v1";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Cache for API responses to reduce unnecessary network requests
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Weather API types
export type WeatherUnit = "celsius" | "fahrenheit";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  apparentTemperature: number;
  isDay: number;
  precipitation: number;
  uvIndex: number;
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  sunrise: string[];
  sunset: string[];
  precipitationSum: number[];
  precipitationProbabilityMax: number[];
  windSpeedMax: number[];
  uvIndexMax: number[];
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  weatherCode: number[];
  windSpeed: number[];
  humidity: number[];
  precipitation: number[];
  precipitationProbability: number[];
  apparentTemperature: number[];
  uvIndex: number[];
  isDay: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast;
  hourly: HourlyForecast;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;  // State/Province
  admin2?: string;  // County/District
}

// Helper function to create cache keys
const createCacheKey = (endpoint: string, params: Record<string, any>): string => {
  return `${endpoint}:${JSON.stringify(params)}`;
};

// Helper function to check cache for valid data
const getFromCache = <T>(cacheKey: string): T | null => {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

// Helper function to add data to cache
const addToCache = (cacheKey: string, data: any): void => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

// Function to fetch with retries and caching
const fetchWithRetry = async <T>(
  url: string, 
  params: Record<string, any>, 
  maxRetries: number = 3
): Promise<T> => {
  const cacheKey = createCacheKey(url, params);
  const cachedData = getFromCache<T>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, { params });
      const data = response.data;
      
      // Cache successful response
      addToCache(cacheKey, data);
      
      return data;
    } catch (error) {
      lastError = error instanceof Error 
        ? error 
        : new Error('Unknown error occurred');
      
      // Only wait before retrying if this is not the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 500ms, 1500ms, 3500ms, etc.
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Failed after multiple retry attempts');
};

// Function to fetch weather data based on coordinates
export const fetchWeatherByCoordinates = async (
  coordinates: Coordinates,
  unit: WeatherUnit = "celsius"
): Promise<WeatherData> => {
  try {
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      current: [
        "temperature_2m",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "relative_humidity_2m",
        "surface_pressure",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "uv_index"
      ],
      hourly: [
        "temperature_2m",
        "weather_code",
        "wind_speed_10m",
        "relative_humidity_2m",
        "precipitation",
        "precipitation_probability",
        "apparent_temperature",
        "uv_index",
        "is_day"
      ],
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "uv_index_max"
      ],
      temperature_unit: unit,
      wind_speed_unit: "kmh",
      timezone: "auto",
      forecast_days: 7
    };

    const data = await fetchWithRetry<any>(`${BASE_URL}/forecast`, params);

    // Map API response to our interface
    const weatherData: WeatherData = {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      current: {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.surface_pressure,
        apparentTemperature: data.current.apparent_temperature,
        isDay: data.current.is_day,
        precipitation: data.current.precipitation,
        uvIndex: data.current.uv_index
      },
      daily: {
        time: data.daily.time,
        weatherCode: data.daily.weather_code,
        temperatureMax: data.daily.temperature_2m_max,
        temperatureMin: data.daily.temperature_2m_min,
        sunrise: data.daily.sunrise,
        sunset: data.daily.sunset,
        precipitationSum: data.daily.precipitation_sum,
        precipitationProbabilityMax: data.daily.precipitation_probability_max,
        windSpeedMax: data.daily.wind_speed_10m_max,
        uvIndexMax: data.daily.uv_index_max
      },
      hourly: {
        time: data.hourly.time,
        temperature: data.hourly.temperature_2m,
        weatherCode: data.hourly.weather_code,
        windSpeed: data.hourly.wind_speed_10m,
        humidity: data.hourly.relative_humidity_2m,
        precipitation: data.hourly.precipitation,
        precipitationProbability: data.hourly.precipitation_probability,
        apparentTemperature: data.hourly.apparent_temperature,
        uvIndex: data.hourly.uv_index,
        isDay: data.hourly.is_day
      }
    };

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to fetch weather data. Please check your connection and try again.");
  }
};

// Function to search for a location using geocoding API
export const searchLocation = async (query: string): Promise<GeocodingResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const params = {
      name: query,
      count: 10,
      language: "en",
      format: "json"
    };
    
    const data = await fetchWithRetry<any>(GEOCODING_URL, params);
    return data.results || [];
  } catch (error) {
    console.error("Error searching for location:", error);
    throw new Error("Failed to search for location. Please try again.");
  }
};

// Get current user location using HTML5 Geolocation API
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Location request timed out. Please try again."));
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again later.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, // Set to false for faster response
        timeout: 10000, // 10 seconds
        maximumAge: 1000 * 60 * 10 // 10 minutes - accept cached position
      }
    );
  });
};

/**
 * Weather API utility for optimized data fetching and caching
 */
const cache = new Map<string, { data: any, timestamp: number }>();

// Cache expiration (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

/**
 * Fetch weather data with built-in caching
 * @param latitude Latitude of location
 * @param longitude Longitude of location
 * @param params Additional API parameters
 * @returns Weather data
 */
export const fetchWeatherDataOptimized = async (
  latitude: number,
  longitude: number,
  params: string = "current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
): Promise<any> => {
  // Round coordinates to reduce cache variations
  const roundedLat = parseFloat(latitude.toFixed(2));
  const roundedLon = parseFloat(longitude.toFixed(2));
  
  // Create cache key
  const cacheKey = `weather:${roundedLat}:${roundedLon}:${params}`;
  
  // Check if data is in cache and not expired
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRATION) {
    console.log("Using cached weather data");
    return cached.data;
  }
  
  // Otherwise fetch fresh data
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&${params}&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

/**
 * Clears all cached weather data
 */
export const clearWeatherCache = () => {
  if (typeof responseCache !== 'undefined') {
    responseCache.clear();
  }
  
  if (typeof cache !== 'undefined') {
    cache.clear();
  }
  
  console.log("Weather cache cleared");
};

/**
 * Prefetch weather data for common locations
 */
export const prefetchCommonLocations = async (): Promise<void> => {
  // Major cities to prefetch
  const locations = [
    { lat: 3.1390, lon: 101.6869 }, // Kuala Lumpur
    { lat: 35.6762, lon: 139.6503 }, // Tokyo
    { lat: 51.5074, lon: -0.1278 }, // London
    { lat: 40.7128, lon: -74.0060 }, // New York
    { lat: 1.3521, lon: 103.8198 } // Singapore
  ];
  
  // Simpler parameters for prefetch
  const simplifiedParams = "current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min";
  
  // Fetch in parallel but don't wait for completion
  locations.forEach(async ({ lat, lon }) => {
    try {
      await fetchWeatherDataOptimized(lat, lon, simplifiedParams);
    } catch (error) {
      // Silently fail - this is just prefetching
      console.log(`Failed to prefetch weather for ${lat},${lon}`);
    }
  });
};
