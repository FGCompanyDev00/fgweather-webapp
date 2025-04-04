import { useState, useEffect } from "react";
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
  Loader2,
  Bell,
  RefreshCw
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
import { useLoading } from "@/App";
import { useLocation, locationDataToComponentFormat } from "@/contexts/LocationContext";
import { LocationData } from "@/lib/utils/location-utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function WeatherMapPage() {
  const { location, isLoading: isLocationLoading, updateLocation } = useLocation();
  
  // Convert LocationData to the format expected by this component
  const formattedLocation = location ? locationDataToComponentFormat(location) : {
    lat: 3.1390, 
    lon: 101.6869, 
    name: "Kuala Lumpur",
    isCurrentLocation: false
  };
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"temperature" | "precipitation" | "clouds" | "wind">("temperature");
  const [unit, setUnit] = useState<"celsius" | "fahrenheit">(() => {
    const savedUnit = localStorage.getItem("fg-weather-unit");
    return (savedUnit === "fahrenheit" ? "fahrenheit" : "celsius");
  });
  
  const { setIsLoading: setGlobalLoading, setLoadingMessage } = useLoading();
  
  // Set global loading state based on map loading
  useEffect(() => {
    if (isLoading || isLocationLoading) {
      setGlobalLoading(true);
      setLoadingMessage("Loading weather map...");
    } else {
      setGlobalLoading(false);
    }
  }, [isLoading, isLocationLoading, setGlobalLoading, setLoadingMessage]);
  
  // Toggle temperature unit and save preference
  const toggleUnit = () => {
    const newUnit = unit === "celsius" ? "fahrenheit" : "celsius";
    setUnit(newUnit);
    localStorage.setItem("fg-weather-unit", newUnit);
  };
  
  // Handle map loading state
  const handleMapLoaded = () => {
    setIsLoading(false);
  };
  
  // Handle map error
  const handleMapError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };
  
  // Test notification functionality
  const testNotification = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in your browser");
      return;
    }
    
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permission to send notifications was denied");
        return;
      }
    }
    
    try {
      new Notification("FGWeather Test Notification", {
        body: `Weather alert test for ${formattedLocation.name}. This is a test notification.`,
        icon: "/logo192.png"
      });
      toast.success("Test notification sent!");
    } catch (error) {
      toast.error("Failed to send test notification");
      console.error(error);
    }
  };
  
  // Handle location change from search
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
    
    // Reset loading state for map
    setIsLoading(true);
    setError(null);
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (error) return <ErrorDisplay message={error} />;

  return (
    <>
      <Helmet>
        <title>Weather Map | {formattedLocation.name} | FGWeather</title>
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
                <Label htmlFor="unit-toggle" className="text-sm font-medium">°C</Label>
                <Switch 
                  id="unit-toggle"
                  checked={unit === "fahrenheit"}
                  onCheckedChange={toggleUnit}
                />
                <Label htmlFor="unit-toggle" className="text-sm font-medium">°F</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={testNotification}
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Test</span>
                </Button>
              </div>
            </div>
            
            <Navigation />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <LocationSearch 
                onLocationChange={handleLocationChange} 
                className="w-full sm:w-auto flex-grow"
              />
              
              {formattedLocation.isCurrentLocation && (
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
                    {formattedLocation.name}
                    {formattedLocation.isCurrentLocation && (
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    )}
                  </CardDescription>
                </div>
                
                <Tabs defaultValue="temperature" value={mapType} onValueChange={(value) => setMapType(value as any)}>
                  <TabsList className="grid grid-cols-4 md:w-[400px]">
                    <TabsTrigger value="temperature" className="flex items-center gap-1">
                      <ThermometerSun className="h-4 w-4" />
                      <span className="hidden md:inline">Temperature</span>
                    </TabsTrigger>
                    <TabsTrigger value="precipitation" className="flex items-center gap-1">
                      <Droplets className="h-4 w-4" />
                      <span className="hidden md:inline">Rain</span>
                    </TabsTrigger>
                    <TabsTrigger value="clouds" className="flex items-center gap-1">
                      <Cloud className="h-4 w-4" />
                      <span className="hidden md:inline">Clouds</span>
                    </TabsTrigger>
                    <TabsTrigger value="wind" className="flex items-center gap-1">
                      <Wind className="h-4 w-4" />
                      <span className="hidden md:inline">Wind</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="h-[75vh] w-full rounded-lg overflow-hidden shadow-lg">
                  <WeatherMap 
                    location={formattedLocation}
                    mapType={mapType} 
                    unit={unit} 
                    onLoaded={handleMapLoaded}
                    onError={handleMapError}
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
                  {mapType === "temperature" && (
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
