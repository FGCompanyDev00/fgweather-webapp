import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AirQualityData {
  european_aqi: number;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  ozone: number;
}

interface AQIDisplayProps {
  airQuality: AirQualityData;
  className?: string;
}

// AQI color mapping
const getAQIColor = (aqi: number): {color: string, bg: string, border: string, text: string} => {
  if (aqi <= 3) {
    return {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-400 dark:border-green-600',
      text: 'Good'
    };
  } else if (aqi <= 6) {
    return {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-400 dark:border-yellow-600',
      text: 'Moderate'
    };
  } else if (aqi <= 9) {
    return {
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      border: 'border-orange-400 dark:border-orange-600',
      text: 'Unhealthy'
    };
  } else {
    return {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-400 dark:border-red-600',
      text: 'Hazardous'
    };
  }
};

export const AQIDisplay = ({ airQuality, className }: AQIDisplayProps) => {
  const aqi = airQuality.european_aqi;
  const { color, bg, border, text } = getAQIColor(aqi);
  
  // Calculate percentage for the progress bar (AQI scale is 1-10)
  const percentage = Math.min((aqi / 10) * 100, 100);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className={cn("p-4 rounded-xl shadow-md", bg, className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-3">Air Quality</h3>
        
        <div className="flex items-center mb-4">
          {/* AQI Circle */}
          <motion.div 
            className={cn(
              "flex items-center justify-center w-16 h-16 text-xl font-bold rounded-full border-4",
              border
            )}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.1 
            }}
          >
            <span className={color}>{aqi}</span>
          </motion.div>
          
          <div className="ml-4">
            <p className={cn("text-lg font-semibold", color)}>{text}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              European AQI
            </p>
          </div>
        </div>
        
        {/* AQI Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
          <motion.div 
            className={cn("h-2.5 rounded-full", color.replace('text', 'bg'))}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        
        {/* Pollutant details */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">PM2.5</p>
            <p className="font-medium">{airQuality.pm2_5.toFixed(1)} μg/m³</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">PM10</p>
            <p className="font-medium">{airQuality.pm10.toFixed(1)} μg/m³</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">NO₂</p>
            <p className="font-medium">{airQuality.nitrogen_dioxide.toFixed(1)} μg/m³</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">O₃</p>
            <p className="font-medium">{airQuality.ozone.toFixed(1)} μg/m³</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 