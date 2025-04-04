import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import { LocationSearch } from "@/components/LocationSearch";
import { CurrentWeather } from "@/components/CurrentWeather";
import { HourlyForecast } from "@/components/HourlyForecast";
import { DailyForecast } from "@/components/DailyForecast";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { fetchWeatherByCoordinates, prefetchCommonLocations } from "@/lib/utils/weather-api";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/App";
import { useLocation, locationDataToComponentFormat } from "@/contexts/LocationContext";
import { LocationData } from "@/lib/utils/location-utils";
import { WeatherCondition } from "@/lib/utils/weather-utils";

// Define weather unit type
type WeatherUnit = 'celsius' | 'fahrenheit';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
  const [unit, setUnit] = useState<WeatherUnit>("celsius");
  
  // Toggle temperature unit
  const toggleUnit = () => {
    setUnit(prev => prev === "celsius" ? "fahrenheit" : "celsius");
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
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
          </div>
          <Navigation />
          <LocationSearch onLocationChange={handleLocationChange} />
        </header>
        
        {weatherData && (
          <motion.main
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <CurrentWeather 
                weatherData={weatherData} 
                locationName={formattedLocation.name} 
                unit={unit} 
                isCurrentLocation={formattedLocation.isCurrentLocation}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <HourlyForecast 
                weatherData={weatherData} 
                unit={unit} 
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DailyForecast 
                weatherData={weatherData}
                unit={unit} 
              />
            </motion.div>
          </motion.main>
        )}
        
        <footer className="mt-8 pt-4 text-sm text-center text-white/70 dark:text-slate-400">
          <p>Developed by Faiz Nasir</p>
        </footer>
      </div>
    </AnimatedBackground>
  );
}
