import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Moon,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  Umbrella,
  Droplets,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LocationSearch } from '@/components/LocationSearch';
import { 
  fetchWeatherByCoordinates, 
  getCurrentLocation, 
  WeatherData 
} from '@/lib/utils/weather-api';

const weatherCodeMap: { [key: number]: string } = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Drizzle: Light intensity',
  53: 'Drizzle: Moderate intensity',
  55: 'Drizzle: Dense intensity',
  56: 'Freezing Drizzle: Light intensity',
  57: 'Freezing Drizzle: Dense intensity',
  61: 'Rain: Slight intensity',
  63: 'Rain: Moderate intensity',
  65: 'Rain: Heavy intensity',
  66: 'Freezing Rain: Light intensity',
  67: 'Freezing Rain: Heavy intensity',
  71: 'Snow fall: Slight intensity',
  73: 'Snow fall: Moderate intensity',
  75: 'Snow fall: Heavy intensity',
  77: 'Snow grains',
  80: 'Rain showers: Slight intensity',
  81: 'Rain showers: Moderate intensity',
  82: 'Rain showers: Violent intensity',
  85: 'Snow showers: Slight intensity',
  86: 'Snow showers: Heavy intensity',
  95: 'Thunderstorm: Slight or moderate',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const getWeatherIcon = (weatherCode: number, isDay: number): React.ReactNode => {
  if (weatherCode >= 0 && weatherCode <= 1) {
    return isDay ? <Sun className="weather-icon" /> : <Moon className="weather-icon" />;
  } else if (weatherCode >= 2 && weatherCode <= 3) {
    return <Cloud className="weather-icon" />;
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    return <CloudRain className="weather-icon" />;
  } else if (weatherCode >= 71 && weatherCode <= 86) {
    return <CloudSnow className="weather-icon" />;
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    return <CloudLightning className="weather-icon" />;
  } else {
    return <Sun className="weather-icon" />;
  }
};

export default function Index() {
  const [location, setLocation] = useState({ lat: 51.5074, lon: -0.1278, name: "London" }); // Default to London
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const { data: weatherData, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', location.lat, location.lon, unit],
    queryFn: () => fetchWeatherByCoordinates(location, unit),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  });

  useEffect(() => {
    const getInitialLocation = async () => {
      setIsLoadingLocation(true);
      try {
        const currentLocation = await getCurrentLocation();
        setLocation({ 
          lat: currentLocation.latitude, 
          lon: currentLocation.longitude,
          name: "Your Location"
        });
      } catch (err: any) {
        console.error("Geolocation error:", err.message);
        // Optionally, use a default location if geolocation fails
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getInitialLocation();
  }, []);

  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    setLocation(newLocation);
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const currentLocation = await getCurrentLocation();
      setLocation({ 
        lat: currentLocation.latitude, 
        lon: currentLocation.longitude,
        name: "Your Location"
      });
    } catch (err: any) {
      console.error("Geolocation error:", err.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorDisplay message={(error as Error).message} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
          </div>
          <Navigation />
          <LocationSearch 
            onLocationChange={handleLocationChange}
            onUseCurrentLocation={handleUseCurrentLocation} 
            isLoadingLocation={isLoadingLocation}
          />
        </header>

        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Weather Card */}
            <Card className="weather-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Weather</span>
                  {getWeatherIcon(weatherData?.current.weatherCode || 0, weatherData?.current.isDay || 1)}
                </CardTitle>
                <CardDescription>{location.name} - {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {weatherData?.current.temperature} {unit === 'celsius' ? '°C' : '°F'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {weatherCodeMap[weatherData?.current.weatherCode || 0]}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span>Feels like: {weatherData?.current.apparentTemperature} {unit === 'celsius' ? '°C' : '°F'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span>Wind: {weatherData?.current.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Umbrella className="h-4 w-4 text-muted-foreground" />
                    <span>Precipitation: {weatherData?.current.precipitation} mm</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span>Humidity: {weatherData?.current.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>UV Index: {weatherData?.current.uvIndex}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>Pressure: {weatherData?.current.pressure} hPa</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Forecast Card */}
            <Card className="weather-card">
              <CardHeader>
                <CardTitle>Daily Forecast</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                {weatherData?.daily.time.map((date, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{new Date(date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <span>{weatherData?.daily.temperatureMax[index]} {unit === 'celsius' ? '°C' : '°F'}</span>
                      <span className="text-muted-foreground">{weatherData?.daily.temperatureMin[index]} {unit === 'celsius' ? '°C' : '°F'}</span>
                      {getWeatherIcon(weatherData?.daily.weatherCode[index] || 0, 1)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sunrise and Sunset Card */}
            <Card className="weather-card">
              <CardHeader>
                <CardTitle>Sunrise & Sunset</CardTitle>
                <CardDescription>Today</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <Sunrise className="h-6 w-6 text-orange-500" />
                    <span>{new Date(weatherData?.daily.sunrise[0] || '').toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Sunset className="h-6 w-6 text-orange-500" />
                    <span>{new Date(weatherData?.daily.sunset[0] || '').toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/map" className="glass-effect p-4 rounded-lg text-center">
              <h2 className="text-lg font-semibold">Weather Map</h2>
              <p className="text-sm text-muted-foreground">Explore interactive weather maps.</p>
            </Link>
            <Link to="/air-quality" className="glass-effect p-4 rounded-lg text-center">
              <h2 className="text-lg font-semibold">Air Quality</h2>
              <p className="text-sm text-muted-foreground">Check the air quality in your location.</p>
            </Link>
          </div>
        </motion.main>

        <footer className="mt-8 pt-4 text-sm text-center text-muted-foreground">
          <p>Developed by: Faiz Nasir | Owned by FGCompany Original</p>
        </footer>
      </div>
    </div>
  );
}
