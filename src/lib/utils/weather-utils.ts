
export type WeatherCondition = 
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'rain'
  | 'showers'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'unknown';

export type WeatherGradient = 
  | 'gradient-sunny' 
  | 'gradient-cloudy' 
  | 'gradient-rainy'
  | 'gradient-stormy'
  | 'gradient-snowy'
  | 'gradient-night';

// Map weather codes to conditions
// WMO Weather interpretation codes (WW)
// https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
export const mapWeatherCode = (code: number, isDay: number): WeatherCondition => {
  // Clear
  if (code === 0) {
    return isDay ? 'clear-day' : 'clear-night';
  }
  // Mainly clear, partly cloudy
  if (code === 1 || code === 2) {
    return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  }
  // Overcast
  if (code === 3) {
    return 'cloudy';
  }
  // Fog
  if (code >= 45 && code <= 48) {
    return 'fog';
  }
  // Drizzle
  if (code >= 51 && code <= 57) {
    return 'showers';
  }
  // Rain
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return 'rain';
  }
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return 'snow';
  }
  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return 'thunderstorm';
  }

  return 'unknown';
};

// Map weather condition to background gradient
export const getWeatherGradient = (condition: WeatherCondition): WeatherGradient => {
  switch(condition) {
    case 'clear-day':
    case 'partly-cloudy-day':
      return 'gradient-sunny';
    case 'clear-night':
    case 'partly-cloudy-night':
      return 'gradient-night';
    case 'cloudy':
    case 'fog':
      return 'gradient-cloudy';
    case 'rain':
    case 'showers':
      return 'gradient-rainy';
    case 'thunderstorm':
      return 'gradient-stormy';
    case 'snow':
      return 'gradient-snowy';
    default:
      return 'gradient-cloudy';
  }
};

// Format date for display
export const formatDate = (dateStr: string, format: 'full' | 'day' | 'time' = 'full'): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {};
  
  if (format === 'full' || format === 'day') {
    options.weekday = format === 'full' ? 'long' : 'short';
  }
  
  if (format === 'full') {
    options.day = 'numeric';
    options.month = 'short';
  }
  
  if (format === 'time') {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Convert temperature to display format with unit
export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string => {
  return `${Math.round(temp)}°${unit === 'celsius' ? 'C' : 'F'}`;
};

// Get the current hours from the forecast
export const getNextNHours = (hourlyForecast: {time: string[]}, hours: number = 24): number[] => {
  const now = new Date();
  const currentHourIndex = hourlyForecast.time.findIndex(time => {
    const hourTime = new Date(time);
    return hourTime >= now;
  });

  if (currentHourIndex === -1) return [];

  const indices: number[] = [];
  for (let i = currentHourIndex; i < currentHourIndex + hours && i < hourlyForecast.time.length; i++) {
    indices.push(i);
  }

  return indices;
};

// Convert wind speed and direction to compass direction and description
export const getWindInfo = (speed: number, direction: number): { compass: string, description: string } => {
  // Convert wind direction to compass points
  const compassPoints = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const compassIndex = Math.round(direction / 22.5) % 16;
  const compass = compassPoints[compassIndex];
  
  // Get wind description
  let description = "Calm";
  if (speed < 1) description = "Calm";
  else if (speed < 6) description = "Light breeze";
  else if (speed < 12) description = "Gentle breeze";
  else if (speed < 20) description = "Moderate breeze";
  else if (speed < 29) description = "Fresh breeze";
  else if (speed < 39) description = "Strong breeze";
  else if (speed < 50) description = "Moderate gale";
  else if (speed < 62) description = "Fresh gale";
  else if (speed < 75) description = "Strong gale";
  else if (speed < 89) description = "Whole gale";
  else if (speed < 103) description = "Storm";
  else description = "Hurricane";
  
  return { compass, description };
};

// Get UV index description
export const getUVIndexDescription = (uvIndex: number): { level: string, advice: string } => {
  if (uvIndex < 3) {
    return { level: "Low", advice: "No protection needed" };
  } else if (uvIndex < 6) {
    return { level: "Moderate", advice: "Wear sunscreen" };
  } else if (uvIndex < 8) {
    return { level: "High", advice: "Seek shade during midday" };
  } else if (uvIndex < 11) {
    return { level: "Very High", advice: "Extra precautions needed" };
  } else {
    return { level: "Extreme", advice: "Avoid being outside" };
  }
};
