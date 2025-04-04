
import { Umbrella } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/lib/utils/weather-api";
import { WeatherIcon } from "./WeatherIcons";
import { formatDate, formatTemperature, mapWeatherCode } from "@/lib/utils/weather-utils";

interface DailyForecastProps {
  weatherData: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

export function DailyForecast({ weatherData, unit }: DailyForecastProps) {
  const { daily } = weatherData;

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div className="flex flex-col divide-y dark:divide-slate-700">
          {daily.time.map((day, index) => {
            const condition = mapWeatherCode(daily.weatherCode[index], 1); // 1 for daytime
            const precipProb = daily.precipitationProbabilityMax[index];
            
            return (
              <div 
                key={day} 
                className="flex items-center justify-between py-3 px-2"
              >
                <div className="w-24 md:w-28">
                  <span className={index === 0 ? "font-medium" : ""}>
                    {index === 0 ? "Today" : formatDate(day, 'day')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {precipProb > 20 && (
                    <div className="flex items-center text-blue-500">
                      <Umbrella className="h-4 w-4 mr-1" />
                      <span className="text-xs">{precipProb}%</span>
                    </div>
                  )}
                  <WeatherIcon condition={condition} className="h-7 w-7" />
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground">
                    {formatTemperature(daily.temperatureMin[index], unit)}
                  </span>
                  <span className="w-16 text-right font-medium">
                    {formatTemperature(daily.temperatureMax[index], unit)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
