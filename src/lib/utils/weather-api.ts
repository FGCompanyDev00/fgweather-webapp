
import axios from "axios";

// Constants
const BASE_URL = "https://api.open-meteo.com/v1";

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

// Function to fetch weather data based on coordinates
export const fetchWeatherByCoordinates = async (
  coordinates: Coordinates,
  unit: WeatherUnit = "celsius"
): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
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
      }
    });

    // Map API response to our interface
    const data = response.data;

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
    throw new Error("Failed to fetch weather data. Please try again.");
  }
};

// Function to search for a location using geocoding API
export const searchLocation = async (query: string): Promise<GeocodingResult[]> => {
  try {
    const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: {
        name: query,
        count: 10,
        language: "en",
        format: "json"
      }
    });

    return response.data.results || [];
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(
          new Error(
            "Unable to retrieve your location. Please enable location access."
          )
        );
      }
    );
  });
};
