import { Droplets, Thermometer, Wind, Gauge, Calendar, Umbrella, Sun, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WeatherIcon } from "./WeatherIcons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  isCurrentLocation?: boolean;
  unit: 'celsius' | 'fahrenheit';
}

export function CurrentWeather({ weatherData, locationName, isCurrentLocation = false, unit }: CurrentWeatherProps) {
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
              <h1 className="text-2xl md:text-4xl font-bold line-clamp-1">{locationName}</h1>
              {isCurrentLocation && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your current location</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main weather display */}
            <div className="flex flex-col items-center sm:items-start space-y-4">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <WeatherIcon condition={condition} className="h-20 w-20 md:h-24 md:w-24" />
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-5xl md:text-6xl font-bold">
                    {formatTemperature(current.temperature, unit)}
                  </span>
                  <span className="text-xl md:text-2xl text-muted-foreground capitalize">
                    {condition.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-lg">
                  Feels like {formatTemperature(current.apparentTemperature, unit)}
                </span>
              </div>
            </div>

            {/* Weather details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 bg-white/20 dark:bg-slate-700/20 p-3 rounded-lg">
                <Wind className="h-5 w-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm md:text-md font-medium">Wind</span>
                  <span className="text-sm md:text-md">
                    {current.windSpeed} km/h {windInfo.compass}
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:block">{windInfo.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/20 dark:bg-slate-700/20 p-3 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm md:text-md font-medium">Humidity</span>
                  <span className="text-sm md:text-md">{current.humidity}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/20 dark:bg-slate-700/20 p-3 rounded-lg">
                <Umbrella className="h-5 w-5 text-blue-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm md:text-md font-medium">Precipitation</span>
                  <span className="text-sm md:text-md">{current.precipitation} mm</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/20 dark:bg-slate-700/20 p-3 rounded-lg">
                <Sun className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm md:text-md font-medium">UV Index</span>
                  <span className="text-sm md:text-md">{current.uvIndex}</span>
                  <span className="text-xs text-muted-foreground hidden md:block">{uvInfo.level}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/20 dark:bg-slate-700/20 p-3 rounded-lg">
                <Gauge className="h-5 w-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm md:text-md font-medium">Pressure</span>
                  <span className="text-sm md:text-md">{current.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
