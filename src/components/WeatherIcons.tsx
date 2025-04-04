import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Wind,
  Cloudy,
  CloudSun,
  CloudMoon,
  CloudHail
} from "lucide-react";
import { WeatherCondition } from "@/lib/utils/weather-utils";

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export function WeatherIcon({ condition, className = "" }: WeatherIconProps) {
  const iconSize = "100%";
  const strokeWidth = 1.5;
  
  // Base animation for all icons
  const baseAnimation = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };
  
  // Sun animation
  const sunAnimation = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 60,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
  
  // Cloud animation
  const cloudAnimation = {
    animate: {
      x: [0, 5, 0, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Rain animation
  const rainAnimation = {
    animate: {
      y: [0, 2, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Lightning animation
  const lightningAnimation = {
    animate: {
      opacity: [1, 0.7, 1, 0.7, 1],
      scale: [1, 1.05, 1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.3, 0.5, 0.7, 1]
      }
    }
  };
  
  // Snow animation
  const snowAnimation = {
    animate: {
      y: [0, 3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Moon animation
  const moonAnimation = {
    animate: {
      scale: [1, 1.03, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Fog animation
  const fogAnimation = {
    animate: {
      x: [0, 5, 0, -5, 0],
      opacity: [0.8, 0.9, 0.8],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderIcon = () => {
    switch (condition) {
      case "clear-day":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div 
              className="text-yellow-500"
              {...sunAnimation}
            >
              <Sun size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      
      case "clear-night":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div 
              className="text-slate-300 dark:text-slate-200"
              {...moonAnimation}
            >
              <Moon size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      
      case "partly-cloudy-day":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...cloudAnimation} className="text-slate-500 dark:text-slate-300">
              <CloudSun size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
          </motion.div>
        );
      
      case "partly-cloudy-night":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...cloudAnimation} className="text-slate-400 dark:text-slate-300">
              <CloudMoon size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
          </motion.div>
        );
      
      case "cloudy":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...cloudAnimation} className="text-slate-500 dark:text-slate-300">
              <Cloud size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
          </motion.div>
        );
      
      case "rain":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...rainAnimation} className="text-blue-500 dark:text-blue-400">
              <CloudRain size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      
      case "showers":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...rainAnimation} className="text-blue-400 dark:text-blue-300">
              <CloudDrizzle size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
          </motion.div>
        );
      
      case "thunderstorm":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...lightningAnimation} className="text-amber-500 dark:text-amber-400">
              <CloudLightning size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-amber-500/10 dark:bg-amber-400/20 blur-xl rounded-full -z-10"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
            />
          </motion.div>
        );
      
      case "snow":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...snowAnimation} className="text-sky-300 dark:text-sky-200">
              <CloudSnow size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-sky-100/20 blur-xl rounded-full -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      
      case "fog":
        return (
          <motion.div {...baseAnimation} className="relative">
            <motion.div {...fogAnimation} className="text-slate-400 dark:text-slate-300">
              <CloudFog size={iconSize} strokeWidth={strokeWidth} />
            </motion.div>
          </motion.div>
        );
      
      default:
        return (
          <motion.div {...baseAnimation}>
            <Sun size={iconSize} strokeWidth={strokeWidth} className="text-yellow-500" />
          </motion.div>
        );
    }
  };

  return (
    <div className={className}>
      {renderIcon()}
    </div>
  );
}
