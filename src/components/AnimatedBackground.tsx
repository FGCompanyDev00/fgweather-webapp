import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/utils/theme-provider';
import { WeatherCondition } from '@/lib/utils/weather-utils';

interface AnimatedBackgroundProps {
  condition?: WeatherCondition;
  children: React.ReactNode;
}

export function AnimatedBackground({ condition = 'clear-day', children }: AnimatedBackgroundProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Make sure we're mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-700 dark:from-slate-800 dark:to-slate-950">{children}</div>;
  }
  
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Define background based on weather condition and theme
  const getBackground = () => {
    switch (condition) {
      case 'clear-day':
        return isDark 
          ? 'from-slate-900 via-blue-900 to-slate-950' 
          : 'from-blue-400 via-sky-300 to-blue-500';
      case 'clear-night':
        return 'from-slate-900 via-indigo-950 to-slate-950';
      case 'partly-cloudy-day':
        return isDark 
          ? 'from-slate-800 via-slate-700 to-slate-900' 
          : 'from-blue-300 via-slate-300 to-blue-400';
      case 'partly-cloudy-night':
        return 'from-slate-900 via-slate-800 to-slate-950';
      case 'cloudy':
        return isDark 
          ? 'from-slate-800 via-slate-700 to-slate-900' 
          : 'from-slate-300 via-slate-200 to-slate-400';
      case 'rain':
      case 'showers':
        return isDark 
          ? 'from-slate-900 via-blue-950 to-slate-900' 
          : 'from-blue-600 via-blue-500 to-blue-700';
      case 'thunderstorm':
        return isDark 
          ? 'from-slate-900 via-purple-950 to-slate-900' 
          : 'from-purple-600 via-purple-500 to-slate-600';
      case 'snow':
        return isDark 
          ? 'from-slate-800 via-slate-700 to-slate-900' 
          : 'from-slate-200 via-white to-slate-300';
      case 'fog':
        return isDark 
          ? 'from-slate-800 via-slate-700 to-slate-800' 
          : 'from-slate-300 via-slate-200 to-slate-300';
      default:
        return isDark 
          ? 'from-slate-900 via-slate-800 to-slate-950' 
          : 'from-blue-400 via-blue-300 to-blue-500';
    }
  };
  
  const getFloatingElements = () => {
    switch (condition) {
      case 'clear-day':
        return (
          <>
            <FloatingElement 
              className="bg-yellow-300 dark:bg-yellow-500 opacity-20 dark:opacity-10" 
              size={80} 
              duration={25} 
              top="10%" 
              left="30%" 
            />
            <FloatingElement 
              className="bg-orange-300 dark:bg-orange-500 opacity-20 dark:opacity-10" 
              size={120} 
              duration={35} 
              top="60%" 
              left="80%" 
            />
          </>
        );
      case 'clear-night':
        return (
          <>
            <FloatingElement 
              className="bg-indigo-300 dark:bg-indigo-500 opacity-10 dark:opacity-5" 
              size={40} 
              duration={30} 
              top="20%" 
              left="20%" 
            />
            <FloatingElement 
              className="bg-purple-300 dark:bg-purple-500 opacity-10 dark:opacity-5" 
              size={60} 
              duration={40} 
              top="70%" 
              left="70%" 
            />
          </>
        );
      case 'partly-cloudy-day':
      case 'partly-cloudy-night':
      case 'cloudy':
        return (
          <>
            <FloatingElement 
              className="bg-slate-300 dark:bg-slate-600 opacity-30 dark:opacity-15 rounded-full blur-xl" 
              size={100} 
              duration={35} 
              top="15%" 
              left="25%" 
            />
            <FloatingElement 
              className="bg-slate-300 dark:bg-slate-600 opacity-30 dark:opacity-15 rounded-full blur-xl" 
              size={150} 
              duration={45} 
              top="65%" 
              left="75%" 
            />
          </>
        );
      case 'rain':
      case 'showers':
        return (
          <>
            <RainDrop count={20} />
          </>
        );
      case 'thunderstorm':
        return (
          <>
            <RainDrop count={15} />
            <LightningFlash />
          </>
        );
      case 'snow':
        return (
          <>
            <Snowflake count={20} />
          </>
        );
      case 'fog':
        return (
          <>
            <FloatingElement 
              className="bg-slate-300 dark:bg-slate-600 opacity-40 dark:opacity-20 rounded-full blur-3xl" 
              size={200} 
              duration={40} 
              top="30%" 
              left="30%" 
            />
            <FloatingElement 
              className="bg-slate-300 dark:bg-slate-600 opacity-40 dark:opacity-20 rounded-full blur-3xl" 
              size={240} 
              duration={50} 
              top="50%" 
              left="60%" 
            />
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${getBackground()}`}>
      <div className="absolute inset-0 overflow-hidden">
        {getFloatingElements()}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface FloatingElementProps {
  className: string;
  size: number;
  duration: number;
  top: string;
  left: string;
}

function FloatingElement({ className, size, duration, top, left }: FloatingElementProps) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        top,
        left,
      }}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 30, 0, -30, 0],
        scale: [1, 1.1, 1, 0.9, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function RainDrop({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const left = `${Math.random() * 100}%`;
        const delay = Math.random() * 2;
        const duration = 0.7 + Math.random() * 0.5;
        
        return (
          <motion.div
            key={index}
            className="absolute top-0 bg-blue-400 dark:bg-blue-600 opacity-50 w-[1px] h-[10px] rounded-full"
            style={{ left }}
            initial={{ top: "-5%", opacity: 0.7 }}
            animate={{ 
              top: "105%", 
              opacity: 0,
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
          />
        );
      })}
    </>
  );
}

function Snowflake({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const left = `${Math.random() * 100}%`;
        const delay = Math.random() * 2;
        const duration = 5 + Math.random() * 5;
        const size = 3 + Math.random() * 5;
        
        return (
          <motion.div
            key={index}
            className="absolute top-0 bg-white dark:bg-white opacity-70 rounded-full"
            style={{ 
              left, 
              width: size, 
              height: size
            }}
            initial={{ top: "-5%", opacity: 0.7 }}
            animate={{ 
              top: "105%", 
              x: [0, 20, -20, 10, -10, 0],
              opacity: 0,
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
          />
        );
      })}
    </>
  );
}

function LightningFlash() {
  return (
    <motion.div
      className="absolute inset-0 bg-yellow-300 dark:bg-yellow-400 opacity-0"
      animate={{ opacity: [0, 0, 0.3, 0, 0, 0.1, 0] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 10 + 5,
        ease: "easeInOut",
      }}
    />
  );
} 