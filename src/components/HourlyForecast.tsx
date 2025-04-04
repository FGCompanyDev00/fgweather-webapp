import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WeatherData } from "@/lib/utils/weather-api";
import { WeatherIcon } from "./WeatherIcons";
import { formatDate, formatTemperature, getNextNHours, mapWeatherCode } from "@/lib/utils/weather-utils";

interface HourlyForecastProps {
  weatherData: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

export function HourlyForecast({ weatherData, unit }: HourlyForecastProps) {
  const { hourly } = weatherData;
  const hourIndices = getNextNHours(hourly, 24);

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Hourly Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex px-4 py-2">
            {hourIndices.map((index) => {
              const time = hourly.time[index];
              const temp = hourly.temperature[index];
              const isDay = hourly.isDay[index];
              const weatherCode = hourly.weatherCode[index];
              const precipProb = hourly.precipitationProbability?.[index] || 0;
              const condition = mapWeatherCode(weatherCode, isDay);
              const formattedTime = formatDate(time, 'time');
              const now = new Date();
              const forecastTime = new Date(time);
              const isNow = Math.abs(now.getTime() - forecastTime.getTime()) < 1800000; // Within 30 minutes

              return (
                <div 
                  key={time} 
                  className={`flex flex-col items-center px-3 py-2 space-y-1 rounded-lg mr-2 min-w-[70px] ${
                    isNow ? 'bg-primary/90 text-primary-foreground' : 'hover:bg-white/20 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium">
                    {isNow ? 'Now' : formattedTime}
                  </span>
                  <WeatherIcon condition={condition} className="h-8 w-8 my-1 sm:my-2" />
                  <span className="font-medium text-sm sm:text-base">
                    {formatTemperature(temp, unit)}
                  </span>
                  {precipProb > 0 && (
                    <span className="text-xs text-blue-500 dark:text-blue-400">
                      {precipProb}% 💧
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
