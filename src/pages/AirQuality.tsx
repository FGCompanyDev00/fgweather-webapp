
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Wind, 
  Droplets, 
  AlertTriangle,
  Gauge,
  Info,
  RefreshCw
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/LocationSearch";
import { fetchAirQualityData, airQualityLevels, getAirQualityLevel, getHealthRecommendations } from "@/lib/utils/air-quality-api";

export default function AirQuality() {
  const [location, setLocation] = useState({ lat: 51.5074, lon: -0.1278, name: "London" }); // Default to London
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const { data: airQualityData, isLoading, error, refetch } = useQuery({
    queryKey: ['airQuality', location.lat, location.lon],
    queryFn: () => fetchAirQualityData(location.lat, location.lon),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  });

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ 
          lat: position.coords.latitude, 
          lon: position.coords.longitude,
          name: "Your Location" 
        });
        setIsLoadingLocation(false);
        toast.success("Using your current location");
      }, (err) => {
        console.error("Geolocation error:", err);
        setIsLoadingLocation(false);
        toast.error("Could not access your location, using default");
      });
    }
  }, []);

  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    setLocation(newLocation);
    toast.success(`Location updated to ${newLocation.name}`);
  };
  
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: "Your Location"
          });
          setIsLoadingLocation(false);
          toast.success("Using your current location");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not get your location");
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };
  
  const handleRefresh = () => {
    toast.info("Refreshing air quality data...");
    refetch();
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (isLoading) return <LoadingScreen />;
  
  if (error) return <ErrorDisplay message={(error as Error).message} />;

  const currentAQI = airQualityData?.current.european_aqi || 0;
  const aqiLevel = getAirQualityLevel(currentAQI);
  const recommendations = getHealthRecommendations(currentAQI);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
            <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full">
              <RefreshCw className="h-5 w-5" />
            </Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Air Quality Index Card */}
            <Card className="lg:col-span-2 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Air Quality Index</CardTitle>
                  <CardDescription>
                    {location.name} - {new Date().toLocaleDateString()} 
                  </CardDescription>
                </div>
                <Badge 
                  className={`text-white px-3 py-1.5 ${airQualityLevels[aqiLevel]?.color}`}
                >
                  {airQualityLevels[aqiLevel]?.title}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-60 h-60 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeOpacity="0.1"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={airQualityLevels[aqiLevel]?.color?.replace('bg-', 'stroke-').replace('-500', '-500')}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min(280, (currentAQI / 100) * 280)} 300`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-bold">{currentAQI}</span>
                      <span className="text-sm text-muted-foreground">AQI</span>
                    </div>
                  </div>
                  
                  <div className="w-full p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm">
                    <p className="text-center mb-3">{airQualityLevels[aqiLevel]?.description}</p>
                    <p className="text-center text-sm text-muted-foreground">
                      Updated {new Date(airQualityData?.current.time || "").toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pollutant Information */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center space-x-2">
                    <span>Pollutants</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={16} className="text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">Concentration of various pollutants in μg/m³</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {airQualityData?.current && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">PM2.5</span>
                        <span>{airQualityData.current.pm2_5} μg/m³</span>
                      </div>
                      <Progress value={(airQualityData.current.pm2_5 / 75) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">PM10</span>
                        <span>{airQualityData.current.pm10} μg/m³</span>
                      </div>
                      <Progress value={(airQualityData.current.pm10 / 150) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">NO₂</span>
                        <span>{airQualityData.current.nitrogen_dioxide} μg/m³</span>
                      </div>
                      <Progress value={(airQualityData.current.nitrogen_dioxide / 200) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">O₃</span>
                        <span>{airQualityData.current.ozone} μg/m³</span>
                      </div>
                      <Progress value={(airQualityData.current.ozone / 180) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">SO₂</span>
                        <span>{airQualityData.current.sulphur_dioxide} μg/m³</span>
                      </div>
                      <Progress value={(airQualityData.current.sulphur_dioxide / 350) * 100} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Health Recommendations */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>Health Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
                  <Wind className="h-8 w-8 text-blue-500" />
                  <h3 className="font-medium">Ventilation</h3>
                  <p className="text-sm text-muted-foreground">
                    {recommendations.ventilation}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <h3 className="font-medium">Outdoor Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    {recommendations.outdoor}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
                  <Gauge className="h-8 w-8 text-blue-500" />
                  <h3 className="font-medium">Sensitive Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    {recommendations.sensitive}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.main>
        
        <footer className="mt-8 pt-4 text-sm text-center text-muted-foreground">
          <p>Developed by: Faiz Nasir | Owned by FGCompany Original</p>
        </footer>
      </div>
    </div>
  );
}
