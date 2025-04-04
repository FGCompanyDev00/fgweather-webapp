
import { Droplets, Thermometer, Wind, Gauge, Calendar, Umbrella, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WeatherIcon } from "./WeatherIcons";
import { WeatherData } from "@/lib/utils/weather-api";
import { 
  formatDate, 
  formatTemperature, 
  getWindInfo, 
  getUVIndexDescription, 
  mapWeatherCode 
} from "@/lib/utils/weather-utils";

interface CurrentWeatherProps {
  weatherData: WeatherData;
  locationName: string;
  unit: 'celsius' | 'fahrenheit';
}

export function CurrentWeather({ weatherData, locationName, unit }: CurrentWeatherProps) {
  const { current } = weatherData;
  const condition = mapWeatherCode(current.weatherCode, current.isDay);
  const windInfo = getWindInfo(current.windSpeed, current.windDirection);
  const uvInfo = getUVIndexDescription(current.uvIndex);
  const formattedDate = formatDate(current.time);

  return (
    <div className="animate-fade-in">
      <Card className="overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-col space-y-1">
            <span className="text-xl md:text-2xl font-normal">{formattedDate}</span>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl md:text-4xl font-bold">{locationName}</h1>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main weather display */}
            <div className="flex flex-col items-start space-y-4">
              <div className="flex items-center space-x-4">
                <WeatherIcon condition={condition} className="h-16 w-16 md:h-24 md:w-24" />
                <div className="flex flex-col">
                  <span className="text-5xl md:text-6xl font-bold">
                    {formatTemperature(current.temperature, unit)}
                  </span>
                  <span className="text-xl md:text-2xl text-muted-foreground capitalize">
                    {condition.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-lg">
                  Feels like {formatTemperature(current.apparentTemperature, unit)}
                </span>
              </div>
            </div>

            {/* Weather details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Wind className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-md font-medium">Wind</span>
                  <span className="text-md">
                    {current.windSpeed} km/h {windInfo.compass}
                  </span>
                  <span className="text-xs text-muted-foreground">{windInfo.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-md font-medium">Humidity</span>
                  <span className="text-md">{current.humidity}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Umbrella className="h-5 w-5 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-md font-medium">Precipitation</span>
                  <span className="text-md">{current.precipitation} mm</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-md font-medium">UV Index</span>
                  <span className="text-md">{current.uvIndex}</span>
                  <span className="text-xs text-muted-foreground">{uvInfo.level}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Gauge className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-md font-medium">Pressure</span>
                  <span className="text-md">{current.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
