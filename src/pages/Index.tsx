
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UnitToggle } from '@/components/UnitToggle';
import { LocationSearch } from '@/components/LocationSearch';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { WeatherChart } from '@/components/WeatherChart';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Navigation } from '@/components/Navigation';
import { useToast } from "@/hooks/use-toast";
import { 
  Coordinates, 
  GeocodingResult, 
  WeatherData, 
  WeatherUnit, 
  fetchWeatherByCoordinates, 
  getCurrentLocation 
} from '@/lib/utils/weather-api';
import { 
  mapWeatherCode, 
  getWeatherGradient 
} from '@/lib/utils/weather-utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const Index = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [unit, setUnit] = useState<WeatherUnit>(() => {
    // Initialize from localStorage or default to celsius
    return (localStorage.getItem('fg-weather-unit') as WeatherUnit) || 'celsius';
  });
  const { toast } = useToast();

  // Save unit preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fg-weather-unit', unit);
  }, [unit]);

  // Fetch weather data
  const {
    data: weatherData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['weather', coordinates?.latitude, coordinates?.longitude, unit],
    queryFn: () => 
      coordinates ? fetchWeatherByCoordinates(coordinates, unit) : Promise.reject('No location selected'),
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false
  });

  // Get user's current location on initial load
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const coords = await getCurrentLocation();
        setCoordinates(coords);
        setLocationName("Current Location");
        toast({
          title: "Location detected",
          description: "Showing weather for your current location.",
        });
      } catch (error) {
        console.error("Error getting user location:", error);
        toast({
          title: "Location unavailable",
          description: "Please search for a location to view weather data.",
          variant: "destructive",
        });
      }
    };

    if (!coordinates) {
      fetchUserLocation();
    }
  }, []);

  // Handle location search
  const handleSelectLocation = (location: GeocodingResult) => {
    setCoordinates({
      latitude: location.latitude,
      longitude: location.longitude
    });
    setLocationName(location.name);
  };

  // Handle current location button
  const handleUseCurrentLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      setLocationName("Current Location");
      toast({
        title: "Location updated",
        description: "Showing weather for your current location.",
      });
    } catch (error) {
      toast({
        title: "Location unavailable",
        description: "Unable to get your current location.",
        variant: "destructive",
      });
    }
  };

  // Determine background gradient based on weather condition
  const backgroundGradient = useMemo(() => {
    if (!weatherData) return 'bg-gradient-cloudy';
    
    const condition = mapWeatherCode(
      weatherData.current.weatherCode,
      weatherData.current.isDay
    );
    
    return `bg-${getWeatherGradient(condition)}`;
  }, [weatherData]);

  return (
    <div className={`min-h-screen ${backgroundGradient} transition-all duration-500`}>
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
            <div className="flex items-center space-x-2">
              <UnitToggle unit={unit} onUnitChange={setUnit} />
              <ThemeToggle />
            </div>
          </div>
          
          <Navigation />
          
          <LocationSearch 
            onSelectLocation={handleSelectLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLoadingLocation={isLoading && !weatherData}
          />
        </header>

        <motion.main 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading && !weatherData && (
            <LoadingScreen />
          )}
          
          {isError && (
            <ErrorDisplay 
              message={error instanceof Error ? error.message : "Failed to load weather data"} 
              retryAction={refetch}
            />
          )}
          
          {weatherData && (
            <>
              <motion.div variants={itemVariants}>
                <CurrentWeather 
                  weatherData={weatherData} 
                  locationName={locationName} 
                  unit={unit}
                />
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <HourlyForecast weatherData={weatherData} unit={unit} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DailyForecast weatherData={weatherData} unit={unit} />
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants}>
                <WeatherChart weatherData={weatherData} unit={unit} />
              </motion.div>
            </>
          )}
        </motion.main>
        
        <footer className="mt-8 pt-4 text-sm text-center text-white/70 dark:text-slate-400">
          <p>Developed by Faiz Nasir</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
