
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudDrizzle, 
  CloudLightning, 
  CloudSnow, 
  CloudRain, 
  CloudFog, 
  Wind,
  Cloudy
} from "lucide-react";
import { WeatherCondition } from "@/lib/utils/weather-utils";

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export function WeatherIcon({ condition, className = "" }: WeatherIconProps) {
  switch (condition) {
    case "clear-day":
      return <Sun className={`text-weather-sunny ${className}`} />;
    case "clear-night":
      return <Moon className={`text-weather-night ${className}`} />;
    case "partly-cloudy-day":
      return (
        <div className="relative inline-block">
          <Sun className={`text-weather-sunny ${className}`} />
          <Cloud className={`text-weather-cloudy absolute -bottom-1 -right-1 scale-75 ${className}`} />
        </div>
      );
    case "partly-cloudy-night":
      return (
        <div className="relative inline-block">
          <Moon className={`text-weather-night ${className}`} />
          <Cloud className={`text-weather-cloudy absolute -bottom-1 -right-1 scale-75 ${className}`} />
        </div>
      );
    case "cloudy":
      return <Cloudy className={`text-weather-cloudy ${className}`} />;
    case "rain":
      return <CloudRain className={`text-weather-rainy ${className}`} />;
    case "showers":
      return <CloudDrizzle className={`text-weather-rainy ${className}`} />;
    case "thunderstorm":
      return <CloudLightning className={`text-weather-stormy ${className}`} />;
    case "snow":
      return <CloudSnow className={`text-weather-snowy ${className}`} />;
    case "fog":
      return <CloudFog className={`text-weather-cloudy ${className}`} />;
    default:
      return <Wind className={`text-weather-cloudy ${className}`} />;
  }
}
