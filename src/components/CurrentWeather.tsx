import { Droplets, Thermometer, Wind, Gauge, Calendar, Umbrella, Sun, MapPin, Sunrise, Sunset } from "lucide-react";
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
import { motion } from "framer-motion";

interface CurrentWeatherProps {
  weatherData: WeatherData;
  locationName: string;
  isCurrentLocation?: boolean;
  unit: 'celsius' | 'fahrenheit';
}

const gradientVariants = {
  day: {
    colors: 'from-blue-500/20 via-sky-400/30 to-blue-400/20',
    hoverColors: 'hover:from-blue-500/30 hover:via-sky-400/40 hover:to-blue-400/30',
    textGradient: 'bg-gradient-to-br from-blue-600 to-sky-500',
    iconGradient: 'from-amber-500 to-orange-600',
    borderLight: 'border-blue-200/50',
    borderDark: 'dark:border-blue-500/20'
  },
  night: {
    colors: 'from-indigo-600/20 via-purple-500/20 to-indigo-500/20',
    hoverColors: 'hover:from-indigo-600/30 hover:via-purple-500/30 hover:to-indigo-500/30',
    textGradient: 'bg-gradient-to-br from-indigo-400 to-purple-300',
    iconGradient: 'from-indigo-400 to-purple-500',
    borderLight: 'border-indigo-200/50',
    borderDark: 'dark:border-indigo-500/20'
  }
};

export function CurrentWeather({ weatherData, locationName, isCurrentLocation = false, unit }: CurrentWeatherProps) {
  const { current, daily } = weatherData;
  const isDay = current.isDay === 1;
  const gradients = isDay ? gradientVariants.day : gradientVariants.night;
  
  const condition = mapWeatherCode(current.weatherCode, current.isDay);
  const windInfo = getWindInfo(current.windSpeed, current.windDirection);
  const uvInfo = getUVIndexDescription(current.uvIndex);
  const formattedDate = formatDate(current.time);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
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

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const iconAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200, 
        damping: 15,
        delay: 0.2
      }
    }
  };
  
  const tempAnimation = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.3
      }
    }
  };
  
  const detailsAnimation = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4
      }
    }
  };
  
  const itemAnimation = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
  
  const floatAnimation = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerAnimation}
      initial="initial"
      animate="animate"
    >
      <Card className={`overflow-hidden backdrop-blur-md bg-gradient-to-br ${gradients.colors} border ${gradients.borderLight} ${gradients.borderDark} transition-all duration-300 hover:shadow-lg ${gradients.hoverColors}`}>
        <div className="p-6 flex flex-col lg:flex-row gap-6 items-center">
          {/* Left Column - Icon and Temperature */}
          <div className="flex items-center gap-6 flex-1">
            <motion.div 
              className="relative"
              variants={iconAnimation}
            >
              <motion.div
                className="w-28 h-28 md:w-32 md:h-32 relative z-10 drop-shadow-xl"
                variants={floatAnimation}
                animate="animate"
              >
                <WeatherIcon 
                  condition={condition}
                  className="w-full h-full"
                />
              </motion.div>
              <div 
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradients.iconGradient} opacity-10 blur-xl -z-0`}
              />
            </motion.div>
            
            <motion.div variants={tempAnimation} className="flex flex-col">
              <h2 className="text-5xl md:text-6xl font-bold">
                <div className={`${gradients.textGradient} inline-block text-transparent bg-clip-text`}>
                  {formatTemperature(current.temperature, unit)}
                </div>
              </h2>
              <div className="flex items-center gap-1 mt-1 text-lg text-muted-foreground">
                <span className="text-muted-foreground">Feels like</span>
                <span className="font-medium">{formatTemperature(current.apparentTemperature, unit)}</span>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{locationName}</span>
                {isCurrentLocation && (
                  <span className="text-xs bg-primary/15 px-1.5 py-0.5 rounded-full text-primary font-medium">Current</span>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Weather Details */}
          <motion.div 
            className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={detailsAnimation}
          >
            <motion.div variants={itemAnimation} className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Humidity</div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-lg font-semibold">{current.humidity}%</span>
              </div>
            </motion.div>
          
            <motion.div variants={itemAnimation} className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Wind Speed</div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                <span className="text-lg font-semibold">{current.windSpeed} km/h</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemAnimation} className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">UV Index</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <motion.div 
                    className="absolute -inset-1 bg-yellow-400/20 dark:bg-yellow-400/30 rounded-full blur-sm"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <Thermometer className="h-4 w-4 text-yellow-500 dark:text-yellow-400 relative" />
                </div>
                <span className="text-lg font-semibold">{current.uvIndex}</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemAnimation} className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Pressure</div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-violet-500 dark:text-violet-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V2M12 4C7.58172 4 4 7.58172 4 12M12 4C16.4183 4 20 7.58172 20 12M20 12C20 16.4183 16.4183 20 12 20M20 12H22M4 12H2M12 20C7.58172 20 4 16.4183 4 12M12 20V22M4 12L12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg font-semibold">{Math.round(current.pressure)} hPa</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemAnimation} className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Sunrise</div>
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <span className="text-lg font-semibold">{formatDate(weatherData.daily.sunrise[0], 'time')}</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemAnimation} className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground mb-1">Sunset</div>
              <div className="flex items-center gap-2">
                <Sunset className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span className="text-lg font-semibold">{formatDate(weatherData.daily.sunset[0], 'time')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
