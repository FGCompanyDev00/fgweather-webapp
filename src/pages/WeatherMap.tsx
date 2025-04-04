
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Map as MapIcon,
  Cloud, 
  Droplets,
  Sun,
  Snowflake,
  Wind,
  ThermometerSnowflake,
  ThermometerSun
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UnitToggle } from "@/components/UnitToggle";
import { LocationSearch } from "@/components/LocationSearch";
import { WeatherMap } from "@/components/WeatherMap";

export default function WeatherMapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<string>("temp");
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [location, setLocation] = useState({ lat: 51.5074, lon: -0.1278, name: "London" });
  
  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: "Your Location"
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    setLocation(newLocation);
    toast.success(`Map centered on ${newLocation.name}`);
  };
  
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: "Your Location"
          });
          setIsLoading(false);
          toast.success("Using your current location");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not get your location");
          setIsLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (isLoading) return <LoadingScreen />;
  
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
          </div>
          <Navigation />
          <LocationSearch 
            onLocationChange={handleLocationChange} 
            onUseCurrentLocation={handleUseCurrentLocation}
            isLoadingLocation={isLoading}
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
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MapIcon className="h-5 w-5" />
                  <span>Weather Map</span>
                </CardTitle>
                <CardDescription>
                  {location.name} - Interactive weather visualization
                </CardDescription>
              </div>
              <UnitToggle unit={unit} onUnitChange={setUnit} />
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                <ToggleGroup type="single" value={mapType} onValueChange={(value) => value && setMapType(value)}>
                  <ToggleGroupItem value="temp" aria-label="Temperature">
                    <ThermometerSun className="h-4 w-4 mr-2" />
                    Temperature
                  </ToggleGroupItem>
                  <ToggleGroupItem value="precipitation" aria-label="Precipitation">
                    <Droplets className="h-4 w-4 mr-2" />
                    Precipitation
                  </ToggleGroupItem>
                  <ToggleGroupItem value="clouds" aria-label="Clouds">
                    <Cloud className="h-4 w-4 mr-2" />
                    Clouds
                  </ToggleGroupItem>
                  <ToggleGroupItem value="wind" aria-label="Wind">
                    <Wind className="h-4 w-4 mr-2" />
                    Wind
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="h-[70vh] w-full rounded-lg overflow-hidden">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {mapType === "temp" && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                      <span>Below 0°{unit === 'celsius' ? 'C' : 'F'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-400"></div>
                      <span>0-15°{unit === 'celsius' ? 'C' : 'F'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
                      <span>15-30°{unit === 'celsius' ? 'C' : 'F'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      <span>Above 30°{unit === 'celsius' ? 'C' : 'F'}</span>
                    </div>
                  </>
                )}
                {mapType === "precipitation" && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100"></div>
                      <span>Light (0-1 mm)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-300"></div>
                      <span>Moderate (1-5 mm)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                      <span>Heavy (5-10 mm)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-700"></div>
                      <span>Very Heavy (&gt;10 mm)</span>
                    </div>
                  </>
                )}
                {mapType === "clouds" && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100"></div>
                      <span>Clear (0-10%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                      <span>Partly Cloudy (10-50%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                      <span>Mostly Cloudy (50-90%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                      <span>Overcast (&gt;90%)</span>
                    </div>
                  </>
                )}
                {mapType === "wind" && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-200"></div>
                      <span>Calm (0-5 km/h)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-400"></div>
                      <span>Light (5-15 km/h)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
                      <span>Moderate (15-30 km/h)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      <span>Strong (&gt;30 km/h)</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.main>
        
        <footer className="mt-8 pt-4 text-sm text-center text-white/70 dark:text-slate-400">
          <p>Developed by: Faiz Nasir | Owned by FGCompany Original</p>
        </footer>
      </div>
    </div>
  );
}
