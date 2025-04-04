
import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherData } from "@/lib/utils/weather-api";
import { formatDate, formatTemperature, getNextNHours } from '@/lib/utils/weather-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface WeatherChartProps {
  weatherData: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

interface ChartDataItem {
  time: string;
  displayTime: string;
  temp: number;
  feelsLike: number;
  precipitation: number;
  precipProbability: number;
  humidity: number;
}

export function WeatherChart({ weatherData, unit }: WeatherChartProps) {
  const [activeParam, setActiveParam] = useState<string>('temp');
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  
  useEffect(() => {
    const { hourly } = weatherData;
    const hourIndices = getNextNHours(hourly, 24);
    
    const data = hourIndices.map((index) => {
      return {
        time: hourly.time[index],
        displayTime: formatDate(hourly.time[index], 'time'),
        temp: Math.round(hourly.temperature[index]),
        feelsLike: Math.round(hourly.apparentTemperature[index]),
        precipitation: hourly.precipitation[index],
        precipProbability: hourly.precipitationProbability[index],
        humidity: hourly.humidity[index],
      };
    });
    
    setChartData(data);
  }, [weatherData]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-gray-200 dark:border-slate-700 rounded-md shadow-md">
          <p className="font-medium">{data.displayTime}</p>
          {activeParam === 'temp' && (
            <>
              <p>Temperature: {formatTemperature(data.temp, unit)}</p>
              <p>Feels like: {formatTemperature(data.feelsLike, unit)}</p>
            </>
          )}
          {activeParam === 'precipitation' && (
            <>
              <p>Precipitation: {data.precipitation} mm</p>
              <p>Chance: {data.precipProbability}%</p>
            </>
          )}
          {activeParam === 'humidity' && (
            <p>Humidity: {data.humidity}%</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>Weather Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temp" onValueChange={setActiveParam}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="temp">Temperature</TabsTrigger>
            <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
          </TabsList>
          <TabsContent value="temp" className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="displayTime" 
                    tick={{ fontSize: 12 }} 
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}°`}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f97316" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                    name="Temperature"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="feelsLike" 
                    stroke="#fb923c" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                    strokeDasharray="3 3"
                    name="Feels like"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="precipitation" className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="displayTime" 
                    tick={{ fontSize: 12 }} 
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="precipitation" 
                    stroke="#0ea5e9" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                    name="Precipitation"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="precipProbability" 
                    stroke="#38bdf8" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                    strokeDasharray="3 3"
                    name="Probability"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="humidity" className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="displayTime" 
                    tick={{ fontSize: 12 }} 
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                    name="Humidity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
