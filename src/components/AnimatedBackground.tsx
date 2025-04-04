import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          : 'from-blue-400 via-sky-300 to-blue-400';
      case 'clear-night':
        return isDark
          ? 'from-slate-900 via-indigo-950 to-slate-950'
          : 'from-indigo-900 via-purple-900 to-slate-900';
      case 'partly-cloudy-day':
        return isDark 
          ? 'from-slate-800 via-slate-700 to-slate-900' 
          : 'from-blue-300 via-slate-300 to-blue-400';
      case 'partly-cloudy-night':
        return isDark
          ? 'from-slate-900 via-slate-800 to-slate-950'
          : 'from-slate-700 via-indigo-900 to-slate-800';
      case 'cloudy':
        return isDark 
          ? 'from-slate-800 via-slate-700 to-slate-900' 
          : 'from-slate-300 via-slate-200 to-slate-400';
      case 'rain':
      case 'showers':
        return isDark 
          ? 'from-slate-900 via-blue-950 to-slate-900' 
          : 'from-blue-500 via-blue-400 to-blue-600';
      case 'thunderstorm':
        return isDark 
          ? 'from-slate-900 via-purple-950 to-slate-900' 
          : 'from-purple-500 via-purple-400 to-slate-600';
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
            <FloatingGradientOrb 
              colors={["#FFD700", "#FFA500"]} 
              size={220} 
              duration={45}
              top="5%" 
              left="75%" 
              blur={80}
              opacity={isDark ? 0.15 : 0.3}
            />
            <FloatingGradientOrb 
              colors={["#FFB74D", "#FF9800"]} 
              size={160} 
              duration={35} 
              top="15%" 
              left="20%" 
              blur={60}
              opacity={isDark ? 0.12 : 0.25}
            />
            <FloatingGradientOrb 
              colors={["#FFECB3", "#FFD54F"]} 
              size={100} 
              duration={25} 
              top="60%" 
              left="85%" 
              blur={40}
              opacity={isDark ? 0.1 : 0.2}
            />
            <FloatingElement 
              className={`${isDark ? 'bg-yellow-500' : 'bg-yellow-300'} opacity-20 dark:opacity-10`}
              size={40} 
              duration={15} 
              top="75%" 
              left="25%" 
            />
            <FloatingElement 
              className={`${isDark ? 'bg-orange-400' : 'bg-orange-200'} opacity-20 dark:opacity-10`}
              size={30} 
              duration={20} 
              top="35%" 
              left="45%" 
            />
            <SunRays />
          </>
        );
      case 'clear-night':
        return (
          <>
            <FloatingGradientOrb 
              colors={["#3F51B5", "#7986CB"]} 
              size={180} 
              duration={40}
              top="10%" 
              left="80%" 
              blur={80}
              opacity={isDark ? 0.15 : 0.25}
            />
            <FloatingGradientOrb 
              colors={["#4A148C", "#7B1FA2"]} 
              size={140} 
              duration={35} 
              top="60%" 
              left="20%" 
              blur={60}
              opacity={isDark ? 0.12 : 0.2}
            />
            <FloatingElement 
              className="bg-blue-300 dark:bg-blue-500 opacity-10 dark:opacity-5" 
              size={30} 
              duration={25} 
              top="30%" 
              left="40%" 
            />
            <FloatingElement 
              className="bg-indigo-300 dark:bg-indigo-500 opacity-10 dark:opacity-5" 
              size={20} 
              duration={20} 
              top="70%" 
              left="60%" 
            />
            <StarField count={40} />
            <MoonGlow />
          </>
        );
      case 'partly-cloudy-day':
        return (
          <>
            <FloatingGradientOrb 
              colors={["#FFD700", "#FFA500"]} 
              size={180} 
              duration={40}
              top="10%" 
              left="75%" 
              blur={70}
              opacity={isDark ? 0.12 : 0.25}
            />
            <FloatingCloud 
              size={120}
              top="20%"
              left="30%"
              duration={50}
              opacity={isDark ? 0.25 : 0.6}
            />
            <FloatingCloud 
              size={80}
              top="40%"
              left="65%"
              duration={40}
              opacity={isDark ? 0.2 : 0.5}
            />
            <FloatingCloud 
              size={100}
              top="70%"
              left="25%"
              duration={60}
              opacity={isDark ? 0.22 : 0.55}
            />
          </>
        );
      case 'partly-cloudy-night':
        return (
          <>
            <StarField count={20} />
            <MoonGlow opacity={0.5} />
            <FloatingCloud 
              size={140}
              top="25%"
              left="60%"
              duration={55}
              opacity={isDark ? 0.25 : 0.55}
            />
            <FloatingCloud 
              size={100}
              top="65%"
              left="30%"
              duration={45}
              opacity={isDark ? 0.22 : 0.5}
            />
          </>
        );
      case 'cloudy':
        return (
          <>
            <FloatingCloud 
              size={150}
              top="15%"
              left="25%"
              duration={60}
              opacity={isDark ? 0.3 : 0.65}
            />
            <FloatingCloud 
              size={120}
              top="35%"
              left="70%"
              duration={50}
              opacity={isDark ? 0.25 : 0.6}
            />
            <FloatingCloud 
              size={100}
              top="60%"
              left="40%"
              duration={40}
              opacity={isDark ? 0.2 : 0.55}
            />
            <FloatingCloud 
              size={80}
              top="80%"
              left="75%"
              duration={30}
              opacity={isDark ? 0.15 : 0.5}
            />
          </>
        );
      case 'rain':
      case 'showers':
        return (
          <>
            <FloatingCloud 
              size={150}
              top="10%"
              left="20%"
              duration={50}
              opacity={isDark ? 0.35 : 0.7}
            />
            <FloatingCloud 
              size={120}
              top="5%"
              left="60%"
              duration={45}
              opacity={isDark ? 0.3 : 0.65}
            />
            <RainDrop count={isDark ? 20 : 30} />
          </>
        );
      case 'thunderstorm':
        return (
          <>
            <FloatingCloud 
              size={170}
              top="5%"
              left="30%"
              duration={55}
              opacity={isDark ? 0.4 : 0.75}
              dark
            />
            <FloatingCloud 
              size={140}
              top="10%"
              left="70%"
              duration={50}
              opacity={isDark ? 0.35 : 0.7}
              dark
            />
            <RainDrop count={isDark ? 15 : 25} heavy />
            <LightningFlash />
          </>
        );
      case 'snow':
        return (
          <>
            <FloatingCloud 
              size={160}
              top="5%"
              left="25%"
              duration={55}
              opacity={isDark ? 0.35 : 0.7}
            />
            <FloatingCloud 
              size={130}
              top="8%"
              left="65%"
              duration={50}
              opacity={isDark ? 0.3 : 0.65}
            />
            <Snowflake count={isDark ? 20 : 30} />
          </>
        );
      case 'fog':
        return (
          <>
            <FogLayer 
              opacity={isDark ? 0.4 : 0.7}
              top="20%"
              duration={70}
            />
            <FogLayer 
              opacity={isDark ? 0.3 : 0.6}
              top="50%"
              duration={60}
            />
            <FogLayer 
              opacity={isDark ? 0.35 : 0.65}
              top="80%"
              duration={80}
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

interface FloatingGradientOrbProps {
  colors: string[];
  size: number;
  duration: number;
  top: string;
  left: string;
  blur: number;
  opacity: number;
}

function FloatingGradientOrb({ colors, size, duration, top, left, blur, opacity }: FloatingGradientOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, ${colors[0]} 0%, ${colors[1]} 100%)`,
        filter: `blur(${blur}px)`,
        opacity
      }}
      animate={{
        y: [0, -40, 0, 40, 0],
        x: [0, 40, 0, -40, 0],
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

function RainDrop({ count, heavy = false }: { count: number, heavy?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const left = `${Math.random() * 100}%`;
        const delay = Math.random() * 2;
        const duration = heavy 
          ? 0.5 + Math.random() * 0.4
          : 0.7 + Math.random() * 0.5;
        const width = heavy ? 2 : 1;
        const height = heavy ? 15 : 10;
        
        return (
          <motion.div
            key={index}
            className="absolute top-0 bg-blue-400 dark:bg-blue-600 opacity-60 rounded-full"
            style={{ 
              left,
              width: `${width}px`,
              height: `${height}px`
            }}
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
        const size = 5 + Math.random() * 5;
        const delay = Math.random() * 5;
        const duration = 15 + Math.random() * 20;
        
        return (
          <motion.div
            key={index}
            className="absolute top-0 bg-white rounded-full opacity-70"
            style={{ 
              left, 
              width: size, 
              height: size 
            }}
            initial={{ top: "-5%", opacity: 0.8 }}
            animate={{ 
              top: "105%", 
              x: [0, 15, 0, -15, 0],
              opacity: [0.8, 0.9, 0.8, 0.9, 0]
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
              x: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        );
      })}
    </>
  );
}

function LightningFlash() {
  return (
    <AnimatePresence>
      {Array.from({ length: 3 }).map((_, index) => {
        const delay = 3 + Math.random() * 7;
        const duration = 0.2 + Math.random() * 0.3;
        const left = 30 + Math.random() * 40;
        
        return (
          <motion.div
            key={index}
            className="absolute inset-0 bg-yellow-100 dark:bg-yellow-200 z-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.2, 0, 0.8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatDelay: delay,
              ease: "easeOut",
            }}
            style={{
              left: `${left}%`,
              width: '20%',
              clipPath: `polygon(
                ${40 + Math.random() * 20}% 0%, 
                ${60 + Math.random() * 20}% 0%, 
                ${50 + Math.random() * 10}% ${40 + Math.random() * 10}%, 
                ${70 + Math.random() * 20}% ${40 + Math.random() * 10}%, 
                ${45 + Math.random() * 10}% 100%, 
                ${35 + Math.random() * 10}% ${50 + Math.random() * 20}%, 
                ${55 + Math.random() * 10}% ${40 + Math.random() * 20}%
              )`
            }}
          />
        );
      })}
    </AnimatePresence>
  );
}

function StarField({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const top = `${Math.random() * 80}%`;
        const left = `${Math.random() * 100}%`;
        const size = 1 + Math.random() * 2;
        const delay = Math.random() * 3;
        const duration = 1 + Math.random() * 2;
        
        return (
          <motion.div
            key={index}
            className="absolute bg-white rounded-full"
            style={{ 
              top, 
              left, 
              width: size, 
              height: size 
            }}
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </>
  );
}

function MoonGlow({ opacity = 0.7 }: { opacity?: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-blue-100 dark:bg-blue-200"
      style={{
        width: 120,
        height: 120,
        top: '15%',
        right: '15%',
        filter: 'blur(30px)',
        opacity: opacity
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [opacity, opacity * 0.8, opacity]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

interface FloatingCloudProps {
  size: number;
  top: string;
  left: string;
  duration: number;
  opacity: number;
  dark?: boolean;
}

function FloatingCloud({ size, top, left, duration, opacity, dark = false }: FloatingCloudProps) {
  return (
    <motion.div
      className={`absolute rounded-full ${dark ? 'bg-slate-600 dark:bg-slate-800' : 'bg-white dark:bg-slate-600'}`}
      style={{
        width: size * 1.6,
        height: size,
        top,
        left,
        filter: `blur(${size / 4}px)`,
        opacity
      }}
      animate={{
        x: [0, 20, 0, -20, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className={`absolute rounded-full ${dark ? 'bg-slate-600 dark:bg-slate-800' : 'bg-white dark:bg-slate-600'}`}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          top: -size * 0.2,
          left: size * 0.4,
          filter: `blur(${size / 4}px)`,
        }}
      />
      <motion.div
        className={`absolute rounded-full ${dark ? 'bg-slate-600 dark:bg-slate-800' : 'bg-white dark:bg-slate-600'}`}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          top: -size * 0.1,
          left: size * 0.8,
          filter: `blur(${size / 4}px)`,
        }}
      />
    </motion.div>
  );
}

interface FogLayerProps {
  opacity: number;
  top: string;
  duration: number;
}

function FogLayer({ opacity, top, duration }: FogLayerProps) {
  return (
    <motion.div
      className="absolute w-screen h-32 bg-slate-200 dark:bg-slate-600"
      style={{
        top,
        filter: 'blur(40px)',
        opacity
      }}
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

function SunRays() {
  return (
    <motion.div
      className="absolute rounded-full bg-yellow-100 dark:bg-yellow-300"
      style={{
        width: 300,
        height: 300,
        top: '5%',
        right: '10%',
        filter: 'blur(20px)',
        opacity: 0.4
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.5, 0.4]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index * 30) * Math.PI / 180;
        const length = 200;
        const x = Math.cos(angle) * length;
        const y = Math.sin(angle) * length;
        
        return (
          <motion.div
            key={index}
            className="absolute bg-yellow-100 dark:bg-yellow-300"
            style={{
              width: 10,
              height: 120 + Math.random() * 60,
              left: '50%',
              top: '50%',
              marginLeft: -5,
              marginTop: -60,
              filter: 'blur(8px)',
              opacity: 0.3,
              transformOrigin: 'center bottom',
              transform: `rotate(${index * 30}deg) translateY(-120px)`
            }}
            animate={{
              height: [120, 140, 120],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{
              duration: 4 + index % 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2
            }}
          />
        );
      })}
    </motion.div>
  );
} 