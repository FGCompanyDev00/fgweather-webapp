
import axios from "axios";

export interface AirQualityResponse {
  current: {
    time: string;
    interval: number;
    european_aqi: number;
    us_aqi: number;
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    ammonia: number;
    dust: number;
  };
  hourly?: {
    time: string[];
    european_aqi: number[];
    pm10: number[];
    pm2_5: number[];
  };
  daily?: {
    time: string[];
    european_aqi_max: number[];
    european_aqi_min: number[];
  };
}

export async function fetchAirQualityData(latitude: number, longitude: number): Promise<AirQualityResponse> {
  try {
    const response = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=european_aqi,pm10,pm2_5&daily=european_aqi_max,european_aqi_min&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia,dust&timezone=auto`
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    throw new Error("Failed to fetch air quality data. Please try again later.");
  }
}

// AQI level categories
export const airQualityLevels = {
  "1": { 
    title: "Good", 
    color: "bg-green-500", 
    description: "Air quality is satisfactory, and air pollution poses little or no risk." 
  },
  "2": { 
    title: "Moderate", 
    color: "bg-yellow-500", 
    description: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution." 
  },
  "3": { 
    title: "Unhealthy for Sensitive Groups", 
    color: "bg-orange-500", 
    description: "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
  },
  "4": { 
    title: "Unhealthy", 
    color: "bg-red-500", 
    description: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."
  },
  "5": { 
    title: "Very Unhealthy", 
    color: "bg-purple-500", 
    description: "Health alert: The risk of health effects is increased for everyone."
  }
};

// Function to get AQI level based on European AQI value
export const getAirQualityLevel = (aqi: number) => {
  if (aqi <= 20) return "1";
  if (aqi <= 40) return "2";
  if (aqi <= 60) return "3";
  if (aqi <= 80) return "4";
  return "5";
};

// Get health recommendations based on AQI level
export const getHealthRecommendations = (aqi: number) => {
  return {
    ventilation: aqi < 40 
      ? "It's a good time to open windows and ventilate." 
      : "Keep windows closed to avoid pollutants entering your home.",
    outdoor: aqi < 60 
      ? "Safe for most outdoor activities." 
      : "Consider limiting prolonged outdoor exertion.",
    sensitive: aqi < 40 
      ? "No special precautions needed." 
      : "Children, elderly and those with respiratory issues should take precautions."
  };
};
