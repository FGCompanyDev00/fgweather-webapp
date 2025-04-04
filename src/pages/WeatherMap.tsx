import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { 
  Map as MapIcon,
  Cloud, 
  Droplets,
  Sun,
  Snowflake,
  Wind,
  ThermometerSnowflake,
  ThermometerSun,
  MapPin,
  Loader2
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UnitToggle } from "@/components/UnitToggle";
import { LocationSearch } from "@/components/LocationSearch";
import { WeatherMap } from "@/components/WeatherMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WeatherMapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<string>("temp");
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>(() => 
    (localStorage.getItem('fg-weather-unit') as 'celsius' | 'fahrenheit') || 'celsius'
  );
  const [location, setLocation] = useState(() => {
    // Try to load from localStorage first if remember location is enabled
    const rememberLocation = localStorage.getItem('fg-weather-remember-location') === 'true';
    const savedCoords = localStorage.getItem('fg-weather-coordinates');
    const savedName = localStorage.getItem('fg-weather-location-name');
    
    if (rememberLocation && savedCoords && savedName) {
      try {
        const coords = JSON.parse(savedCoords);
        return {
          lat: coords.latitude,
          lon: coords.longitude,
          name: savedName,
          isCurrentLocation: localStorage.getItem('fg-weather-is-current-location') === 'true'
        };
      } catch (e) {
        // Fallback to default
        return { lat: 3.1390, lon: 101.6869, name: "Kuala Lumpur", isCurrentLocation: false };
      }
    }
    
    // Default to London
    return { lat: 3.1390, lon: 101.6869, name: "Kuala Lumpur", isCurrentLocation: false };
  });
  
  // Get user's location if not already using a saved one
  useEffect(() => {
    if (!location.isCurrentLocation && navigator.geolocation) {
      setIsLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get the actual location name using reverse geocoding
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&count=1&language=en&format=json`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch location name');
            }
            
            const data = await response.json();
            let locationName;
            
            if (data.results && data.results.length > 0) {
              // Use the actual name, with city/town, state/district if available
              locationName = data.results[0].name;
              
              if (data.results[0].admin3) {
                locationName = `${locationName}, ${data.results[0].admin3}`;
              } else if (data.results[0].admin2) {
                locationName = `${locationName}, ${data.results[0].admin2}`;
              } else if (data.results[0].admin1) {
                locationName = `${locationName}, ${data.results[0].admin1}`;
              }
            } else {
              // Fallback to coordinates if no name is found
              locationName = `Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
            }
            
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: locationName,
              isCurrentLocation: true
            });
            
            // Save to localStorage that this is the current location
            if (localStorage.getItem('fg-weather-remember-location') === 'true') {
              localStorage.setItem('fg-weather-is-current-location', 'true');
              localStorage.setItem('fg-weather-coordinates', JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }));
              localStorage.setItem('fg-weather-location-name', locationName);
            }
            
            setIsLoading(false);
          } catch (err) {
            console.error("Geocoding error:", err);
            // Use coordinates as fallback location name
            const fallbackName = `Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
            
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: fallbackName,
              isCurrentLocation: true
            });
            
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
          toast.error("Couldn't get your location. Using default.");
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    setLocation({
      ...newLocation,
      isCurrentLocation: false
    });
    
    // Update localStorage flag
    if (localStorage.getItem('fg-weather-remember-location') === 'true') {
      localStorage.setItem('fg-weather-is-current-location', 'false');
    }
    
    toast.success(`Map centered on ${newLocation.name}`);
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Testing notification function 
  const testNotification = () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in your browser");
      return;
    }
    
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        // Show test notification with the current map location
        const notification = new Notification("Weather Map Notification Test", {
          body: `This is a test notification for ${location.name}`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png"
        });
        
        toast.success("Test notification sent!");
      } else {
        toast.error("Notification permission denied. Please enable notifications in your browser settings.");
      }
    });
  };

  if (isLoading) return <LoadingScreen />;
  
  if (error) return <ErrorDisplay message={error} />;

  return (
    <>
      <Helmet>
        <title>Weather Map | FGWeather</title>
        <meta name="description" content="Interactive weather map visualization for any location" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
        <div className="container mx-auto px-4 py-6 min-h-screen">
          <header className="flex flex-col space-y-6 mb-8">
            <div className="flex justify-between items-center">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400"
                animate={{ 
                  textShadow: [
                    "0 0 5px rgba(37,99,235,0.3)",
                    "0 0 15px rgba(37,99,235,0.3)",
                    "0 0 5px rgba(37,99,235,0.3)"
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
                <UnitToggle unit={unit} onUnitChange={(val) => setUnit(val as 'celsius' | 'fahrenheit')} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testNotification}
                  className="flex items-center gap-1"
                >
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Test Notification</span>
                </Button>
              </div>
            </div>
            
            <Navigation />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <LocationSearch 
                onLocationChange={handleLocationChange} 
                className="w-full sm:w-auto flex-grow"
              />
              
              {location.isCurrentLocation && (
                <Badge variant="outline" className="flex gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  <MapPin className="h-3.5 w-3.5" />
                  Current Location
                </Badge>
              )}
            </div>
          </header>
          
          <motion.main
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6"
          >
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MapIcon className="h-5 w-5" />
                    <span>Weather Map</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    {location.name}
                    {location.isCurrentLocation && (
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    )}
                  </CardDescription>
                </div>
                
                <Tabs defaultValue="temp" className="w-full sm:w-auto" onValueChange={setMapType}>
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="temp" className="flex items-center gap-1.5">
                      <ThermometerSun className="h-3.5 w-3.5" />
                      <span>Temperature</span>
                    </TabsTrigger>
                    <TabsTrigger value="precipitation" className="flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5" />
                      <span>Rain</span>
                    </TabsTrigger>
                    <TabsTrigger value="clouds" className="flex items-center gap-1.5">
                      <Cloud className="h-3.5 w-3.5" />
                      <span>Clouds</span>
                    </TabsTrigger>
                    <TabsTrigger value="wind" className="flex items-center gap-1.5">
                      <Wind className="h-3.5 w-3.5" />
                      <span>Wind</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="h-[75vh] w-full rounded-lg overflow-hidden shadow-lg">
                  <WeatherMap 
                    location={location}
                    mapType={mapType} 
                    unit={unit} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mapType === "temp" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-md"></div>
                        <span>Below 0°{unit === 'celsius' ? 'C' : 'F'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-green-300 shadow-md"></div>
                        <span>0-15°{unit === 'celsius' ? 'C' : 'F'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-md"></div>
                        <span>15-30°{unit === 'celsius' ? 'C' : 'F'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-red-400 shadow-md"></div>
                        <span>Above 30°{unit === 'celsius' ? 'C' : 'F'}</span>
                      </div>
                    </>
                  )}
                  {mapType === "precipitation" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-200 to-blue-100 shadow-md"></div>
                        <span>Light (0-1 mm)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-300 shadow-md"></div>
                        <span>Moderate (1-5 mm)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-md"></div>
                        <span>Heavy (5-10 mm)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-800 to-blue-700 shadow-md"></div>
                        <span>Very Heavy (&gt;10 mm)</span>
                      </div>
                    </>
                  )}
                  {mapType === "clouds" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-100 to-white shadow-md"></div>
                        <span>Clear (0-10%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-300 to-gray-200 shadow-md"></div>
                        <span>Partly Cloudy (10-50%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-500 to-gray-400 shadow-md"></div>
                        <span>Mostly Cloudy (50-90%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 shadow-md"></div>
                        <span>Overcast (&gt;90%)</span>
                      </div>
                    </>
                  )}
                  {mapType === "wind" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-300 to-green-200 shadow-md"></div>
                        <span>Calm (0-5 km/h)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-md"></div>
                        <span>Light (5-15 km/h)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-md"></div>
                        <span>Moderate (15-30 km/h)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-md"></div>
                        <span>Strong (&gt;30 km/h)</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Note: Visualization is generated from the latest available weather data
              </CardFooter>
            </Card>
          </motion.main>
          
          <footer className="mt-8 pt-4 text-sm text-center text-white/70 dark:text-slate-400">
            <p>Developed by Faiz Nasir</p>
          </footer>
        </div>
      </div>
    </>
  );
}
