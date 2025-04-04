
import axios from "axios";

interface AirQualityResponse {
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
