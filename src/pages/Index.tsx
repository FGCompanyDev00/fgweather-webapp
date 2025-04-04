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
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useToast } from "@/hooks/use-toast";
import { useLoading } from '@/App';
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
  getWeatherGradient,
  WeatherCondition
} from '@/lib/utils/weather-utils';
import { Helmet } from "react-helmet-async";

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
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    // Try to load from localStorage first
    const savedCoords = localStorage.getItem('fg-weather-coordinates');
    if (savedCoords) {
      try {
        return JSON.parse(savedCoords);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [locationName, setLocationName] = useState<string>(() => 
    localStorage.getItem('fg-weather-location-name') || ''
  );
  
  const [unit, setUnit] = useState<WeatherUnit>(() => {
    // Initialize from localStorage or default to celsius
    return (localStorage.getItem('fg-weather-unit') as WeatherUnit) || 'celsius';
  });
  
  const { toast } = useToast();
  const { setIsLoading, setLoadingMessage } = useLoading();

  // Save unit preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fg-weather-unit', unit);
  }, [unit]);
  
  // Save coordinates and location name to localStorage when they change
  useEffect(() => {
    if (coordinates) {
      localStorage.setItem('fg-weather-coordinates', JSON.stringify(coordinates));
    }
    if (locationName) {
      localStorage.setItem('fg-weather-location-name', locationName);
    }
  }, [coordinates, locationName]);

  // Fetch weather data
  const {
    data: weatherData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['weather', coordinates?.latitude, coordinates?.longitude, unit],
    queryFn: () => 
      coordinates ? fetchWeatherByCoordinates(coordinates, unit) : Promise.reject('No location selected'),
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Handle errors from query 
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Failed to load weather data",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Get user's current location on initial load
  useEffect(() => {
    if (!coordinates) {
      setIsLoading(true);
      setLoadingMessage("Detecting your location...");
      
      const fetchUserLocation = async () => {
        try {
          const coords = await getCurrentLocation();
          
          // Get the actual location name using reverse geocoding
          try {
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?latitude=${coords.latitude}&longitude=${coords.longitude}&count=1&language=en&format=json`
            );
            
            const data = await response.json();
            const locationName = data.results?.[0]?.name || "Current Location";
            
            setCoordinates(coords);
            setLocationName(locationName);
            
            toast({
              title: "Location detected",
              description: `Showing weather for ${locationName}`,
            });
          } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError);
            setCoordinates(coords);
            setLocationName("Current Location");
            
            toast({
              title: "Location detected",
              description: "Showing weather for your current location.",
            });
          }
        } catch (error) {
          console.error("Error getting user location:", error);
          toast({
            title: "Location unavailable",
            description: "Please search for a location to view weather data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

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
      
      // Get the actual location name using reverse geocoding
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?latitude=${coords.latitude}&longitude=${coords.longitude}&count=1&language=en&format=json`
        );
        
        const data = await response.json();
        const locationName = data.results?.[0]?.name || "Current Location";
        
        setCoordinates(coords);
        setLocationName(locationName);
        
        toast({
          title: "Location updated",
          description: `Showing weather for ${locationName}`,
        });
      } catch (geocodeError) {
        console.error("Geocoding error:", geocodeError);
        setCoordinates(coords);
        setLocationName("Current Location");
        
        toast({
          title: "Location updated",
          description: "Showing weather for your current location.",
        });
      }
    } catch (error) {
      toast({
        title: "Location unavailable",
        description: "Unable to get your current location.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update loading state when fetching data
  useEffect(() => {
    if (isFetching && !weatherData) {
      setIsLoading(true);
      setLoadingMessage("Loading weather data...");
    } else {
      setIsLoading(false);
    }
  }, [isFetching, weatherData, setIsLoading, setLoadingMessage]);

  // Determine weather condition for background
  const weatherCondition = useMemo<WeatherCondition>(() => {
    if (!weatherData) return 'clear-day';
    
    return mapWeatherCode(
      weatherData.current.weatherCode,
      weatherData.current.isDay
    );
  }, [weatherData]);
  
  // Prepare page title
  const pageTitle = useMemo(() => {
    if (!weatherData || !locationName) return 'FGWeather - Loading...';
    
    return `${Math.round(weatherData.current.temperature)}°${unit === 'celsius' ? 'C' : 'F'} | ${locationName} | FGWeather`;
  }, [weatherData, locationName, unit]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Get accurate weather forecasts and real-time updates for any location." />
      </Helmet>
      
      <AnimatedBackground condition={weatherCondition}>
        <div className="container mx-auto px-4 py-6 min-h-screen">
          <header className="flex flex-col space-y-6 mb-8">
            <div className="flex justify-between items-center">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-white dark:text-white"
                animate={{ 
                  textShadow: [
                    "0 0 5px rgba(255,255,255,0.5)",
                    "0 0 15px rgba(255,255,255,0.5)",
                    "0 0 5px rgba(255,255,255,0.5)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                FGWeather
              </motion.h1>
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
            {(isLoading && !weatherData) && (
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
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </AnimatedBackground>
    </>
  );
};

export default Index;
