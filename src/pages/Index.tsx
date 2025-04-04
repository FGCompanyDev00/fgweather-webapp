import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  ThermometerSun, 
  ThermometerSnowflake,
  RefreshCw,
  Droplets,
  Wind,
  Sun,
  Moon,
  Thermometer,
  Menu,
  X
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { LocationSearch } from "@/components/LocationSearch";
import { CurrentWeather } from "@/components/CurrentWeather";
import { HourlyForecast } from "@/components/HourlyForecast";
import { DailyForecast } from "@/components/DailyForecast";
import { WeatherChart } from "@/components/WeatherChart";
import { WeatherIcon } from "@/components/WeatherIcons";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { fetchWeatherByCoordinates, prefetchCommonLocations } from "@/lib/utils/weather-api";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/App";
import { useLocation, locationDataToComponentFormat } from "@/contexts/LocationContext";
import { LocationData } from "@/lib/utils/location-utils";
import { WeatherCondition, mapWeatherCode } from "@/lib/utils/weather-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/lib/utils/useLocalStorage";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define weather unit type
type WeatherUnit = 'celsius' | 'fahrenheit';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { 
      ease: "easeInOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

const floatingAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Index() {
  const { location, isLoading: isLocationLoading, updateLocation } = useLocation();
  
  // Convert LocationData to the format expected by this component
  const formattedLocation = location ? locationDataToComponentFormat(location) : {
    lat: 3.1390, 
    lon: 101.6869, 
    name: "Kuala Lumpur",
    isCurrentLocation: false
  };
  
  const { setIsLoading, setLoadingMessage } = useLoading();
  const [unit, setUnit] = useLocalStorage<WeatherUnit>("fg-weather-unit", "celsius");
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle temperature unit
  const toggleUnit = () => {
    setUnit(unit === "celsius" ? "fahrenheit" : "celsius");
    toast.success(`Temperature unit changed to ${unit === "celsius" ? "Fahrenheit" : "Celsius"}`);
  };
  
  // Load user unit preference
  useEffect(() => {
    const savedUnit = localStorage.getItem("fg-weather-unit");
    if (savedUnit === "fahrenheit" || savedUnit === "celsius") {
      setUnit(savedUnit as WeatherUnit);
    }
  }, []);
  
  // Save user unit preference
  useEffect(() => {
    localStorage.setItem("fg-weather-unit", unit);
  }, [unit]);

  const {
    data: weatherData,
    isLoading: isWeatherLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['weather', formattedLocation.lat, formattedLocation.lon, unit],
    queryFn: () => fetchWeatherByCoordinates({
      latitude: formattedLocation.lat,
      longitude: formattedLocation.lon
    }, unit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: !!formattedLocation
  });

  // Set global loading state based on weather data loading
  useEffect(() => {
    if (isWeatherLoading) {
      setIsLoading(true);
      setLoadingMessage("Fetching weather data...");
    } else {
      setIsLoading(false);
    }
  }, [isWeatherLoading, setIsLoading, setLoadingMessage]);

  // Handle manual location change from search
  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    // Convert to LocationData format
    const locationData: LocationData = {
      latitude: newLocation.lat,
      longitude: newLocation.lon,
      name: newLocation.name,
      isCurrentLocation: false
    };
    
    // Update location in the context
    updateLocation(locationData);
  };
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success("Weather data updated!");
    } catch (err) {
      toast.error("Failed to update weather data");
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // Preload map resources when on the main page
  useEffect(() => {
    // Preload map resources for faster navigation
    const preloadMapResources = async () => {
      // Prefetch common locations weather data
      prefetchCommonLocations();
      
      // Preload map tile images
      const tileUrls = [
        "https://a.basemaps.cartocdn.com/light_all/5/15/12.png",
        "https://b.basemaps.cartocdn.com/light_all/5/16/12.png",
        "https://c.basemaps.cartocdn.com/light_all/5/15/11.png",
        "https://d.basemaps.cartocdn.com/light_all/5/16/11.png"
      ];
      
      tileUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
      
      // Preload Leaflet library
      try {
        await import('leaflet');
        console.log("Leaflet preloaded");
      } catch (err) {
        console.log("Failed to preload Leaflet", err);
      }
    };
    
    // Start preloading after initial render
    setTimeout(preloadMapResources, 3000);
  }, []);

  if (isLocationLoading || isWeatherLoading) return <LoadingScreen />;
  
  if (error) return <ErrorDisplay message={(error as Error).message} />;

  // Get the proper weather condition for the background
  const weatherCondition: WeatherCondition = weatherData?.current.isDay ? 'clear-day' : 'clear-night';
  
  // Determine if it's daytime or nighttime for UI adjustments
  const isDay = weatherData?.current.isDay === 1;

  return (
    <AnimatedBackground condition={weatherCondition}>
      <Helmet>
        <title>
          {weatherData ? 
            `${Math.round(weatherData.current.temperature)}°${unit === 'celsius' ? 'C' : 'F'} | ${formattedLocation.name} | FGWeather` : 
            'FGWeather - Real-time Weather'
          }
        </title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold text-white dark:text-white"
              animate={{ 
                textShadow: [
                  "0 0 8px rgba(255,255,255,0.5)",
                  "0 0 16px rgba(255,255,255,0.5)",
                  "0 0 8px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              FGWeather
            </motion.h1>
            <div className="flex items-center gap-2">
              {/* Mobile Menu Trigger */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-gradient-to-br from-blue-950/90 to-slate-900/95 backdrop-blur-lg border-r border-white/10">
                  <div className="flex flex-col space-y-6 h-full py-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white">FGWeather</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Navigation />
                    
                    {/* Current Temperature in Sidebar */}
                    {weatherData && (
                      <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14">
                            <WeatherIcon 
                              condition={mapWeatherCode(weatherData.current.weatherCode, weatherData.current.isDay)}
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-white">
                              {Math.round(weatherData.current.temperature)}°{unit === 'celsius' ? 'C' : 'F'}
                            </div>
                            <div className="text-sm text-white/70">{formattedLocation.name}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/80">
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            <span>{weatherData.current.windSpeed} km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            <span>{weatherData.current.humidity}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Temperature Unit Toggle in Sidebar */}
                    <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="text-sm font-medium text-white mb-2">Temperature Unit</div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={unit === 'celsius' ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (unit !== 'celsius') {
                              setUnit('celsius');
                              toast.success("Changed to Celsius");
                            }
                          }}
                          className={`flex items-center gap-1 flex-1 ${unit === 'celsius' ? 'bg-primary' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                        >
                          <ThermometerSun className="h-3.5 w-3.5" />
                          <span>°C</span>
                        </Button>
                        <Button 
                          variant={unit === 'fahrenheit' ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (unit !== 'fahrenheit') {
                              setUnit('fahrenheit');
                              toast.success("Changed to Fahrenheit");
                            }
                          }}
                          className={`flex items-center gap-1 flex-1 ${unit === 'fahrenheit' ? 'bg-primary' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                        >
                          <ThermometerSnowflake className="h-3.5 w-3.5" />
                          <span>°F</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-auto text-xs text-center text-white/50">
                      Developed by Faiz Nasir
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Unit Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleUnit}
                  className="flex items-center gap-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
                >
                  {unit === 'celsius' ? (
                    <>
                      <ThermometerSun className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">°C</span>
                    </>
                  ) : (
                    <>
                      <ThermometerSnowflake className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">°F</span>
                    </>
                  )}
                </Button>
              </motion.div>
              
              {/* Refresh Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
                >
                  <motion.div
                    animate={refreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, ease: "linear" }}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </motion.div>
                </Button>
              </motion.div>
              
              {/* Day/Night Indicator */}
              <motion.div
                variants={pulseAnimation}
                animate="animate"
                className="hidden sm:flex"
              >
                <Badge variant="outline" className="gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm text-white border-white/20">
                  {isDay ? (
                    <>
                      <Sun className="h-3.5 w-3.5" />
                      <span className="text-xs">Day</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5" />
                      <span className="text-xs">Night</span>
                    </>
                  )}
                </Badge>
              </motion.div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
          
          <LocationSearch onLocationChange={handleLocationChange} />
        </header>

        {weatherData && (
        <motion.main 
            className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
            exit="exit"
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={`current-${formattedLocation.name}-${unit}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <CurrentWeather 
                  weatherData={weatherData} 
                  locationName={formattedLocation.name} 
                  unit={unit} 
                  isCurrentLocation={formattedLocation.isCurrentLocation}
                />
              </motion.div>
            </AnimatePresence>
            
            {/* New Weather Chart Component */}
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <WeatherChart 
                weatherData={weatherData} 
                  unit={unit}
                />
              </motion.div>
              
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <HourlyForecast 
                weatherData={weatherData} 
                unit={unit} 
              />
                </motion.div>
            
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <DailyForecast 
                weatherData={weatherData}
                unit={unit} 
              />
                </motion.div>

            {/* Weather Info Floaters - purely decorative */}
            <div className="fixed w-full h-full top-0 left-0 pointer-events-none overflow-hidden -z-10">
              <motion.div
                className="absolute text-white/20 text-6xl font-bold select-none"
                initial={{ x: '80vw', y: '25vh' }}
                variants={floatingAnimation}
                animate="animate"
              >
                <Droplets size={48} strokeWidth={0.5} />
              </motion.div>
              <motion.div
                className="absolute text-white/10 text-5xl font-bold select-none"
                initial={{ x: '10vw', y: '60vh' }}
                variants={floatingAnimation}
                animate="animate"
                transition={{ delay: 1.5 }}
              >
                <Wind size={42} strokeWidth={0.5} />
              </motion.div>
              <motion.div
                className="absolute text-white/15 text-4xl font-bold select-none"
                initial={{ x: '60vw', y: '75vh' }}
                variants={floatingAnimation}
                animate="animate"
                transition={{ delay: 0.8 }}
              >
                {isDay ? (
                  <Sun size={38} strokeWidth={0.5} />
                ) : (
                  <Moon size={38} strokeWidth={0.5} />
                )}
              </motion.div>
            </div>
        </motion.main>
        )}
        
        <motion.footer 
          className="mt-8 pt-4 pb-20 md:pb-4 text-sm text-center text-white/70 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>Developed by Faiz Nasir</p>
        </motion.footer>
      </div>
    </AnimatedBackground>
  );
}
