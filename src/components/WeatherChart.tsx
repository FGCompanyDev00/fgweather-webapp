import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WeatherData } from "@/lib/utils/weather-api";
import { formatDate, formatTemperature, getNextNHours } from '@/lib/utils/weather-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps, AreaChart, Area, Legend, ReferenceLine } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Calendar, Clock, Droplets, Sun, Wind, Thermometer } from 'lucide-react';

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
  uvIndex: number;
  windSpeed: number;
}

// Time range types
type TimeRange = 'hourly' | 'daily' | 'weekly' | 'monthly';

export function WeatherChart({ weatherData, unit }: WeatherChartProps) {
  const [activeParam, setActiveParam] = useState<string>('temp');
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  
  // Get chart data based on time range
  useEffect(() => {
    const { hourly, daily } = weatherData;
    
    if (timeRange === 'hourly') {
      // Next 12 hours
      const hourIndices = getNextNHours(hourly, 12);
      
      const data = hourIndices.map((index) => {
        return {
          time: hourly.time[index],
          displayTime: formatDate(hourly.time[index], 'time'),
          temp: Math.round(hourly.temperature[index]),
          feelsLike: Math.round(hourly.apparentTemperature[index]),
          precipitation: hourly.precipitation[index],
          precipProbability: hourly.precipitationProbability[index],
          humidity: hourly.humidity[index],
          uvIndex: hourly.uvIndex[index],
          windSpeed: hourly.windSpeed[index]
        };
      });
      
      setChartData(data);
    } 
    else if (timeRange === 'daily') {
      // Next 24 hours
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
          uvIndex: hourly.uvIndex[index],
          windSpeed: hourly.windSpeed[index]
        };
      });
      
      setChartData(data);
    }
    else if (timeRange === 'weekly') {
      // Next 7 days, using daily data
      const data = daily.time.map((time, index) => {
        return {
          time: time,
          displayTime: formatDate(time, 'day'),
          temp: Math.round(daily.temperatureMax[index]),
          feelsLike: Math.round(daily.temperatureMax[index] - 2), // Approximation
          precipitation: daily.precipitationSum[index],
          precipProbability: daily.precipitationProbabilityMax[index],
          humidity: 60, // Approximation as daily doesn't have humidity
          uvIndex: daily.uvIndexMax[index],
          windSpeed: daily.windSpeedMax[index]
        };
      });
      
      setChartData(data);
    }
    else if (timeRange === 'monthly') {
      // For monthly view, we'll consolidate the 7 days with slight predictions
      // This is a simplified approximation as the API doesn't provide monthly data
      const data = daily.time.map((time, index) => {
        return {
          time: time,
          displayTime: formatDate(time, 'day'),
          temp: Math.round(daily.temperatureMax[index]),
          feelsLike: Math.round(daily.temperatureMax[index] - 2), // Approximation
          precipitation: daily.precipitationSum[index],
          precipProbability: daily.precipitationProbabilityMax[index],
          humidity: 60, // Approximation
          uvIndex: daily.uvIndexMax[index],
          windSpeed: daily.windSpeedMax[index]
        };
      });
      
      setChartData(data);
    }
  }, [weatherData, timeRange]);
  
  // Get min and max values for chart
  const getMinMax = (dataKey: string) => {
    if (!chartData.length) return { min: 0, max: 100 };
    
    const values = chartData.map(item => (item as any)[dataKey]);
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    
    // Add some padding
    return { 
      min: min > 5 ? min - 5 : 0, 
      max: max + 5 
    };
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl"
        >
          <p className="font-medium mb-1 border-b pb-1 text-primary dark:text-blue-400">{data.displayTime}</p>
          {activeParam === 'temp' && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-sm">Temperature:</span> 
                <span className="font-medium">{formatTemperature(data.temp, unit)}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-300"></span>
                <span className="text-sm">Feels like:</span>
                <span className="font-medium">{formatTemperature(data.feelsLike, unit)}</span>
              </p>
            </div>
          )}
          {activeParam === 'precipitation' && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-sm">Precipitation:</span>
                <span className="font-medium">{data.precipitation} mm</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span className="text-sm">Chance:</span>
                <span className="font-medium">{data.precipProbability}%</span>
              </p>
            </div>
          )}
          {activeParam === 'humidity' && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-sm">Humidity:</span>
                <span className="font-medium">{data.humidity}%</span>
              </p>
            </div>
          )}
          {activeParam === 'uv' && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm">UV Index:</span>
                <span className="font-medium">{data.uvIndex}</span>
              </p>
            </div>
          )}
          {activeParam === 'wind' && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                <span className="text-sm">Wind Speed:</span>
                <span className="font-medium">{data.windSpeed} km/h</span>
              </p>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };
  
  // Dot renderer with animation
  const CustomizedDot = ({ cx, cy, stroke, index }: any) => {
    return (
      <motion.circle 
        cx={cx} 
        cy={cy} 
        r={4}
        stroke="white"
        strokeWidth={1}
        fill={stroke}
        key={`dot-${index}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1 
        }}
        transition={{ 
          delay: index * 0.02,
          duration: 0.3
        }}
      />
    );
  };
  
  // Gradient definitions
  const gradientOffset = () => {
    if (!chartData.length) return 0;
    
    const dataMax = Math.max(...chartData.map(item => item.temp));
    const dataMin = Math.min(...chartData.map(item => item.temp));
    
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
    
    return dataMax / (dataMax - dataMin);
  };
  
  const off = gradientOffset();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <span>Weather Trends</span>
              <motion.span
                className="inline-block text-primary"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 2 
                }}
              >
                {activeParam === 'temp' && <Thermometer className="h-5 w-5" />}
                {activeParam === 'precipitation' && <Droplets className="h-5 w-5" />}
                {activeParam === 'humidity' && <Droplets className="h-5 w-5" />}
                {activeParam === 'uv' && <Sun className="h-5 w-5" />}
                {activeParam === 'wind' && <Wind className="h-5 w-5" />}
              </motion.span>
            </CardTitle>
            
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant={timeRange === 'hourly' ? 'default' : 'outline'}
                className="h-7 rounded-full text-xs flex items-center gap-1"
                onClick={() => setTimeRange('hourly')}
              >
                <Clock className="h-3 w-3" /> <span>12h</span>
              </Button>
              <Button
                size="sm"
                variant={timeRange === 'daily' ? 'default' : 'outline'}
                className="h-7 rounded-full text-xs flex items-center gap-1"
                onClick={() => setTimeRange('daily')}
              >
                <Clock className="h-3 w-3" /> <span>24h</span>
              </Button>
              <Button
                size="sm"
                variant={timeRange === 'weekly' ? 'default' : 'outline'}
                className="h-7 rounded-full text-xs flex items-center gap-1"
                onClick={() => setTimeRange('weekly')}
              >
                <Calendar className="h-3 w-3" /> <span>Week</span>
              </Button>
              <Button
                size="sm"
                variant={timeRange === 'monthly' ? 'default' : 'outline'}
                className="h-7 rounded-full text-xs flex items-center gap-1"
                onClick={() => setTimeRange('monthly')}
              >
                <Calendar className="h-3 w-3" /> <span>Month</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="temp" onValueChange={setActiveParam}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full mb-4">
              <TabsTrigger value="temp">Temperature</TabsTrigger>
              <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
              <TabsTrigger value="humidity">Humidity</TabsTrigger>
              <TabsTrigger value="uv">UV Index</TabsTrigger>
              <TabsTrigger value="wind">Wind</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="temp" className="pt-2 h-[300px] sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={off} stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset={off} stopColor="#f97316" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorFeelsLike" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="displayTime" 
                      tick={{ fontSize: 11 }} 
                      interval="preserveStartEnd"
                      tickMargin={10}
                      padding={{ left: 5, right: 5 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}°`}
                      width={25}
                      domain={[getMinMax('temp').min, getMinMax('temp').max]}
                      padding={{ top: 15, bottom: 15 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#f97316" 
                      fill="url(#colorTemp)"
                      strokeWidth={3} 
                      activeDot={{ r: 6 }}
                      name="Temperature"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="feelsLike" 
                      stroke="#fb923c" 
                      fill="url(#colorFeelsLike)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      activeDot={{ r: 5 }}
                      name="Feels like"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="precipitation" className="pt-2 h-[300px] sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="displayTime" 
                      tick={{ fontSize: 11 }} 
                      interval="preserveStartEnd"
                      tickMargin={10}
                      padding={{ left: 5, right: 5 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}`}
                      width={25}
                      padding={{ top: 15, bottom: 0 }}
                      domain={[0, getMinMax('precipitation').max]}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                      width={35}
                      padding={{ top: 15, bottom: 0 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="precipitation" 
                      stroke="#0ea5e9" 
                      fill="url(#colorPrecip)"
                      strokeWidth={3} 
                      dot={<CustomizedDot />}
                      activeDot={{ r: 6 }}
                      name="Precipitation (mm)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="precipProbability" 
                      stroke="#38bdf8" 
                      strokeWidth={2}
                      yAxisId="right"
                      dot={<CustomizedDot />}
                      activeDot={{ r: 5 }}
                      name="Probability (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="humidity" className="pt-2 h-[300px] sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="displayTime" 
                      tick={{ fontSize: 11 }} 
                      interval="preserveStartEnd"
                      tickMargin={10}
                      padding={{ left: 5, right: 5 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                      width={25}
                      padding={{ top: 15, bottom: 0 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#8b5cf6" 
                      fill="url(#colorHumidity)"
                      strokeWidth={3} 
                      dot={<CustomizedDot />}
                      activeDot={{ r: 6 }}
                      name="Humidity (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="uv" className="pt-2 h-[300px] sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorUV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="displayTime" 
                      tick={{ fontSize: 11 }} 
                      interval="preserveStartEnd"
                      tickMargin={10}
                      padding={{ left: 5, right: 5 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      domain={[0, getMinMax('uvIndex').max]}
                      width={25}
                      padding={{ top: 15, bottom: 0 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="uvIndex" 
                      stroke="#eab308" 
                      fill="url(#colorUV)"
                      strokeWidth={3} 
                      dot={<CustomizedDot />}
                      activeDot={{ r: 6 }}
                      name="UV Index"
                    />
                    {/* Reference lines for UV Index categories */}
                    <ReferenceLine y={3} stroke="rgba(234, 179, 8, 0.4)" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Moderate', fill: '#eab308', fontSize: 10 }} />
                    <ReferenceLine y={6} stroke="rgba(234, 179, 8, 0.6)" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'High', fill: '#eab308', fontSize: 10 }} />
                    <ReferenceLine y={8} stroke="rgba(234, 179, 8, 0.8)" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Very High', fill: '#eab308', fontSize: 10 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="wind" className="pt-2 h-[300px] sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="displayTime" 
                      tick={{ fontSize: 11 }} 
                      interval="preserveStartEnd"
                      tickMargin={10}
                      padding={{ left: 5, right: 5 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}`}
                      domain={[0, getMinMax('windSpeed').max]}
                      width={30}
                      padding={{ top: 15, bottom: 0 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="windSpeed" 
                      stroke="#14b8a6" 
                      fill="url(#colorWind)"
                      strokeWidth={3} 
                      dot={<CustomizedDot />}
                      activeDot={{ r: 6 }}
                      name="Wind Speed (km/h)"
                    />
                    {/* Reference lines for wind categories */}
                    <ReferenceLine y={20} stroke="rgba(20, 184, 166, 0.4)" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Moderate', fill: '#14b8a6', fontSize: 10 }} />
                    <ReferenceLine y={40} stroke="rgba(20, 184, 166, 0.6)" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Strong', fill: '#14b8a6', fontSize: 10 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
