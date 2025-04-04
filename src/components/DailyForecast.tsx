import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="backdrop-blur-md border border-white/20 dark:border-slate-700/40 shadow-lg h-full overflow-hidden bg-gradient-to-b from-white/70 to-white/60 dark:from-slate-800/70 dark:to-slate-800/60">
        <CardHeader className="pb-2 bg-gradient-to-r from-sky-100/30 to-blue-100/30 dark:from-sky-900/30 dark:to-blue-900/30">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>7-Day Forecast</span>
            <motion.div 
              className="text-xs py-1 px-2 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Daily
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {daily.time.map((day, index) => {
              const condition = mapWeatherCode(daily.weatherCode[index], 1); // 1 for daytime
              const precipProb = daily.precipitationProbabilityMax[index];
              const isToday = index === 0;
              const tempMin = daily.temperatureMin[index];
              const tempMax = daily.temperatureMax[index];
              
              return (
                <motion.div 
                  key={day} 
                  variants={itemVariants}
                  className={`flex items-center justify-between py-3 px-3 border-b border-slate-200/50 dark:border-slate-700/30 last:border-0 ${
                    isToday ? 'bg-gradient-to-r from-sky-500/10 to-blue-500/5 dark:from-blue-500/10 dark:to-sky-500/5' : 'hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors'
                  }`}
                  whileHover={{ 
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="w-[80px] sm:w-24 md:w-28">
                    <span className={`text-sm sm:text-base ${isToday ? "font-semibold" : ""}`}>
                      {isToday ? "Today" : formatDate(day, 'day')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {precipProb > 20 && (
                      <motion.div 
                        className="flex items-center text-blue-500 dark:text-blue-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          delay: 0.2 + (index * 0.05)
                        }}
                      >
                        <Umbrella className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="text-[10px] sm:text-xs font-medium">{precipProb}%</span>
                      </motion.div>
                    )}
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7">
                      <WeatherIcon condition={condition} />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex flex-col items-end mr-4 sm:mr-6">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {formatTemperature(tempMin, unit)}
                      </span>
                    </div>
                    <div className="w-12 sm:w-16 text-right font-medium text-sm sm:text-base">
                      <span className="relative">
                        {formatTemperature(tempMax, unit)}
                        {isToday && (
                          <motion.span 
                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 to-sky-400 dark:from-blue-500 dark:to-sky-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
