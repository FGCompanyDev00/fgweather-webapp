
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
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Hourly Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex px-4 py-2">
            {hourIndices.map((index) => {
              const time = hourly.time[index];
              const temp = hourly.temperature[index];
              const isDay = hourly.isDay[index];
              const weatherCode = hourly.weatherCode[index];
              const condition = mapWeatherCode(weatherCode, isDay);
              const formattedTime = formatDate(time, 'time');
              const now = new Date();
              const forecastTime = new Date(time);
              const isNow = Math.abs(now.getTime() - forecastTime.getTime()) < 1800000; // Within 30 minutes

              return (
                <div 
                  key={time} 
                  className={`flex flex-col items-center px-3 py-2 space-y-1 rounded-lg mr-1 ${
                    isNow ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <span className="text-sm font-medium">
                    {isNow ? 'Now' : formattedTime}
                  </span>
                  <WeatherIcon condition={condition} className="h-8 w-8 my-2" />
                  <span className="font-medium">
                    {formatTemperature(temp, unit)}
                  </span>
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
