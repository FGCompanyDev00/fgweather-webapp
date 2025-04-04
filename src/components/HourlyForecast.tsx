import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative"
    >
      <motion.div 
        className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/5 to-sky-500/5 dark:from-blue-500/10 dark:to-sky-500/10 rounded-xl blur-md -z-10"
        animate={{
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <Card className="backdrop-blur-md bg-gradient-to-t from-white/60 to-white/80 dark:from-slate-800/60 dark:to-slate-800/80 border border-white/30 dark:border-slate-700/30 shadow-lg overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-100/20 to-sky-100/20 dark:from-blue-900/20 dark:to-sky-900/20">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Hourly Forecast</span>
            <motion.div 
              className="text-xs py-1 px-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              24h
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex px-4 py-3">
              {hourIndices.map((index, i) => {
                const time = hourly.time[index];
                const temp = hourly.temperature[index];
                const isDay = hourly.isDay[index];
                const weatherCode = hourly.weatherCode[index];
                const precipProb = hourly.precipitationProbability?.[index] || 0;
                const condition = mapWeatherCode(weatherCode, isDay);
                const formattedTime = formatDate(time, 'time');
                const now = new Date();
                const forecastTime = new Date(time);
                const isNow = Math.abs(now.getTime() - forecastTime.getTime()) < 1800000;

                return (
                  <motion.div 
                    key={time} 
                    variants={itemVariants}
                    className={`flex flex-col items-center px-4 py-3 space-y-2 rounded-xl mr-2 min-w-[75px] backdrop-blur-sm 
                    ${
                      isNow 
                        ? 'bg-gradient-to-b from-blue-500/90 to-sky-500/90 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/10 dark:bg-slate-700/10 hover:bg-white/30 dark:hover:bg-white/10 transition-colors'
                    }`}
                    whileHover={{ 
                      y: -3,
                      transition: { 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 10 
                      }
                    }}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${isNow ? 'text-white/90' : ''}`}>
                      {isNow ? 'Now' : formattedTime}
                    </span>
                    
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10">
                        <WeatherIcon condition={condition} />
                      </div>
                      {precipProb > 20 && (
                        <motion.div 
                          className={`absolute -right-2 -bottom-1 text-xs font-medium px-1 rounded-full ${
                            isNow ? 'bg-white/80 text-blue-600' : 'bg-blue-500/80 text-white'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            delay: 0.2 + (i * 0.02) 
                          }}
                        >
                          {precipProb}%
                        </motion.div>
                      )}
                    </div>
                    
                    <motion.span 
                      className={`font-medium text-sm sm:text-base ${isNow ? 'text-white' : ''}`}
                      animate={isNow ? {
                        scale: [1, 1.1, 1],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      } : {}}
                    >
                      {formatTemperature(temp, unit)}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
