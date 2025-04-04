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
  MapPin,
  Loader2
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LocationSearch } from "@/components/LocationSearch";
import { fetchAirQualityData } from "@/lib/utils/air-quality-api";
import { useLoading } from "@/App";
import { useLocation, locationDataToComponentFormat, componentFormatToLocationData } from "@/contexts/LocationContext";
import { LocationData } from "@/lib/utils/location-utils";

interface AirQualityLevels {
  [key: string]: {
    title: string;
    color: string;
    textColor: string;
    bgColor: string;
    progressColor: string;
    description: string;
    emoji: string;
  }
}

export default function AirQuality() {
  const { location, isLoading: isLocationLoading, updateLocation } = useLocation();
  
  // Convert LocationData to the format expected by this component
  const formattedLocation = location ? locationDataToComponentFormat(location) : {
    lat: 3.1390, 
    lon: 101.6869, 
    name: "Kuala Lumpur",
    isCurrentLocation: false
  };
  
  const { setIsLoading, setLoadingMessage } = useLoading();
  
  const { data: airQualityData, isLoading: isDataLoading, error, refetch } = useQuery({
    queryKey: ['airQuality', formattedLocation.lat, formattedLocation.lon],
    queryFn: () => fetchAirQualityData(formattedLocation.lat, formattedLocation.lon),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    enabled: !!formattedLocation
  });

  useEffect(() => {
    if (isDataLoading) {
      setIsLoading(true);
      setLoadingMessage("Loading air quality data...");
    } else {
      setIsLoading(false);
    }
  }, [isDataLoading, setIsLoading, setLoadingMessage]);

  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    // When manually selecting a location, it's not the user's current location
    const locationData: LocationData = {
      latitude: newLocation.lat,
      longitude: newLocation.lon,
      name: newLocation.name,
      isCurrentLocation: false
    };
    
    // Update location in the context
    updateLocation(locationData);
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Air quality levels definitions with improved colors
  const airQualityLevels: AirQualityLevels = {
    "1": { 
      title: "Good", 
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      progressColor: "bg-green-500",
      description: "Air quality is satisfactory, and air pollution poses little or no risk.", 
      emoji: "😊" 
    },
    "2": { 
      title: "Moderate", 
      color: "bg-yellow-500", 
      textColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      progressColor: "bg-yellow-500",
      description: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.", 
      emoji: "🙂" 
    },
    "3": { 
      title: "Unhealthy for Sensitive Groups", 
      color: "bg-orange-500", 
      textColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      progressColor: "bg-orange-500",
      description: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
      emoji: "😐" 
    },
    "4": { 
      title: "Unhealthy", 
      color: "bg-red-500", 
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30", 
      progressColor: "bg-red-500",
      description: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
      emoji: "😷" 
    },
    "5": { 
      title: "Very Unhealthy", 
      color: "bg-purple-500", 
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      progressColor: "bg-purple-500",
      description: "Health alert: The risk of health effects is increased for everyone.",
      emoji: "⚠️" 
    }
  };

  const getAirQualityLevel = (aqi: number) => {
    if (aqi <= 50) return "1";
    if (aqi <= 100) return "2";
    if (aqi <= 150) return "3";
    if (aqi <= 200) return "4";
    return "5";
  };

  // Helper to get the correct progress color based on value
  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage <= 20) return airQualityLevels["1"].progressColor;
    if (percentage <= 40) return airQualityLevels["2"].progressColor;
    if (percentage <= 60) return airQualityLevels["3"].progressColor;
    if (percentage <= 80) return airQualityLevels["4"].progressColor;
    return airQualityLevels["5"].progressColor;
  };

  if (isLocationLoading || isDataLoading) return <LoadingScreen />;
  
  if (error) return <ErrorDisplay message={(error as Error).message} />;

  const currentAQI = airQualityData?.current.european_aqi || 0;
  const aqiLevel = getAirQualityLevel(currentAQI);
  const aqiInfo = airQualityLevels[aqiLevel];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
          </div>
          <Navigation />
          <LocationSearch onLocationChange={handleLocationChange} />
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
                  <CardDescription className="flex items-center">
                    {formattedLocation.name}
                    {formattedLocation.isCurrentLocation && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MapPin className="ml-1 h-4 w-4 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your current location</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <span className="mx-1">-</span>
                    {new Date().toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge 
                  className={`text-white px-3 py-1.5 ${aqiInfo.color}`}
                >
                  {aqiInfo.title}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <motion.div 
                    className="relative w-60 h-60 flex items-center justify-center"
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      repeatType: "mirror"
                    }}
                  >
                    <div className={`absolute inset-0 rounded-full ${aqiInfo.bgColor} opacity-20`}></div>
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
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={aqiInfo.color.replace('bg-', 'stroke-').replace('-500', '-500')}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min(280, (currentAQI / 300) * 280)} 300`}
                        initial={{ strokeDashoffset: 300 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-6xl font-bold ${aqiInfo.textColor}`}>{currentAQI}</span>
                      <span className="text-sm text-muted-foreground">AQI</span>
                      <span className="text-2xl mt-1">{aqiInfo.emoji}</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className={`w-full p-4 rounded-lg ${aqiInfo.bgColor} backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className={`text-center mb-3 ${aqiInfo.textColor} font-medium`}>{aqiInfo.description}</p>
                  </motion.div>
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
                      <Progress 
                        value={(airQualityData.current.pm2_5 / 75) * 100} 
                        className="h-2"
                        indicatorClassName={getProgressColor(airQualityData.current.pm2_5, 75)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">PM10</span>
                        <span>{airQualityData.current.pm10} μg/m³</span>
                      </div>
                      <Progress 
                        value={(airQualityData.current.pm10 / 150) * 100} 
                        className="h-2"
                        indicatorClassName={getProgressColor(airQualityData.current.pm10, 150)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">NO₂</span>
                        <span>{airQualityData.current.nitrogen_dioxide} μg/m³</span>
                      </div>
                      <Progress 
                        value={(airQualityData.current.nitrogen_dioxide / 200) * 100} 
                        className="h-2"
                        indicatorClassName={getProgressColor(airQualityData.current.nitrogen_dioxide, 200)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">O₃</span>
                        <span>{airQualityData.current.ozone} μg/m³</span>
                      </div>
                      <Progress 
                        value={(airQualityData.current.ozone / 180) * 100} 
                        className="h-2"
                        indicatorClassName={getProgressColor(airQualityData.current.ozone, 180)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">SO₂</span>
                        <span>{airQualityData.current.sulphur_dioxide} μg/m³</span>
                      </div>
                      <Progress 
                        value={(airQualityData.current.sulphur_dioxide / 350) * 100} 
                        className="h-2"
                        indicatorClassName={getProgressColor(airQualityData.current.sulphur_dioxide, 350)}
                      />
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
                    {currentAQI < 50 
                      ? "It's a good time to open windows and ventilate." 
                      : "Keep windows closed to avoid pollutants entering your home."}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <h3 className="font-medium">Outdoor Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentAQI < 100 
                      ? "Safe for most outdoor activities." 
                      : "Consider limiting prolonged outdoor exertion."}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
                  <Gauge className="h-8 w-8 text-blue-500" />
                  <h3 className="font-medium">Sensitive Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentAQI < 50 
                      ? "No special precautions needed." 
                      : "Children, elderly and those with respiratory issues should take precautions."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.main>
        
        <footer className="mt-8 pt-4 text-sm text-center text-white/70 dark:text-slate-400">
          <p>Developed by Faiz Nasir</p>
        </footer>
      </div>
    </div>
  );
}
