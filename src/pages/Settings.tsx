import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { 
  Moon, Sun, BellRing, BellOff, Trash2, 
  RefreshCw, AlertTriangle, MapPin, Bell, Database, RotateCcw
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/utils/theme-provider";
import { fetchWeatherByCoordinates, clearWeatherCache } from "@/lib/utils/weather-api";
import { formatTemperature } from "@/lib/utils/weather-utils";
import { useLoading } from "@/App";
import { LocationSearch } from "@/components/LocationSearch";
import { useLocation, locationDataToComponentFormat } from "@/contexts/LocationContext";
import { LocationData } from "@/lib/utils/location-utils";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { location, isLoading: isLocationLoading, updateLocation } = useLocation();
  const { setIsLoading, setLoadingMessage } = useLoading();
  
  // Convert LocationData to the format expected by this component
  const formattedLocation = location ? locationDataToComponentFormat(location) : {
    lat: 3.1390, 
    lon: 101.6869, 
    name: "Kuala Lumpur",
    isCurrentLocation: false
  };
  
  const [rememberLocation, setRememberLocation] = useState<boolean>(() => 
    localStorage.getItem('fg-weather-remember-location') === 'true'
  );
  
  const [weatherAlerts, setWeatherAlerts] = useState<boolean>(() => 
    localStorage.getItem('fg-weather-alerts') === 'true'
  );
  
  // Handle toggle for remembering location
  const handleToggleRememberLocation = (checked: boolean) => {
    setRememberLocation(checked);
    localStorage.setItem('fg-weather-remember-location', checked.toString());
    
    if (!checked) {
      // Clear saved location data
      localStorage.removeItem('fg-weather-coordinates');
      localStorage.removeItem('fg-weather-location-name');
      localStorage.removeItem('fg-weather-is-current-location');
      toast.info("Location preferences cleared");
    } else {
      toast.success("Location preferences will be remembered");
    }
  };
  
  // Toggle weather alerts
  const handleToggleWeatherAlerts = async (checked: boolean) => {
    if (checked) {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        toast.error("Notifications are not supported in your browser");
        return;
      }
      
      // Request permission if not already granted
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Permission to send notifications was denied");
          return;
        }
      }
      
      // Send a test notification
      sendTestNotification();
    }
    
    setWeatherAlerts(checked);
    localStorage.setItem('fg-weather-alerts', checked.toString());
  };
  
  // Handle clearing all app data
  const handleClearAllData = () => {
    // Clear all localStorage items related to the app
    localStorage.removeItem('fg-weather-remember-location');
    localStorage.removeItem('fg-weather-coordinates');
    localStorage.removeItem('fg-weather-location-name');
    localStorage.removeItem('fg-weather-is-current-location');
    localStorage.removeItem('fg-weather-unit');
    localStorage.removeItem('fg-weather-alerts');
    localStorage.removeItem('fg-weather-theme');
    
    // Reset states
    setRememberLocation(false);
    setWeatherAlerts(false);
    
    // Notify user
    toast.success("All app data has been cleared");
    
    // Reload the page to reflect changes
    window.location.reload();
  };
  
  // Send test notification using current weather data
  const sendTestNotification = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in your browser");
      return;
    }

    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      toast.warning(
        "Browser notifications aren't fully supported on mobile devices. For best experience, install our web app to home screen or use desktop browser.",
        {
          duration: 6000,
        }
      );
    }
    
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission().catch(() => "denied");
      if (permission !== "granted") {
        toast.error("Permission to send notifications was denied");
        return;
      }
    }
    
    try {
      setLoadingMessage("Preparing test notification...");
      setIsLoading(true);
      
      // Fetch current weather for notification content
      const weatherData = await fetchWeatherByCoordinates({
        latitude: formattedLocation.lat,
        longitude: formattedLocation.lon
      }, 'celsius');
      
      const temp = formatTemperature(weatherData.current.temperature, 'celsius');
      
      if (isMobile) {
        // On mobile, show a toast instead of notification
        toast.info(`Current weather in ${formattedLocation.name}: ${temp}. This is a test notification.`, {
          duration: 5000,
        });
      } else {
        // Regular notification on desktop
        new Notification("FGWeather Alert", {
          body: `Current weather in ${formattedLocation.name}: ${temp}. This is a test notification.`,
          icon: "/logo192.png"
        });
      }
      
      toast.success("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    } finally {
      setIsLoading(false);
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
  };
  
  // Clear app data (confirmations, saved locations, etc.)
  const clearAppData = () => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to clear all app data? This cannot be undone.")) {
      // Clear localStorage
      localStorage.removeItem("fg-weather-location");
      localStorage.removeItem("fg-weather-unit");
      localStorage.removeItem("fg-weather-bookmarked-news");
      localStorage.removeItem("fg-weather-remember-location");
      localStorage.removeItem("fg-weather-api-failed-date");
      
      // Clear caches
      clearWeatherCache();
      
      toast.success("All app data has been cleared");
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // Clear just the weather cache (for faster data refresh)
  const clearCacheOnly = () => {
    clearWeatherCache();
    toast.success("Weather cache cleared");
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      <Helmet>
        <title>Settings | FGWeather</title>
      </Helmet>
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="mr-2 h-5 w-5" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme-toggle">Theme Mode</Label>
                    <CardDescription>
                      Choose between light and dark mode
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <Switch 
                      id="theme-toggle"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                    <Moon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="remember-location">Remember Location</Label>
                    <CardDescription>
                      Save your location preferences between visits
                    </CardDescription>
                  </div>
                  <Switch 
                    id="remember-location"
                    checked={rememberLocation}
                    onCheckedChange={handleToggleRememberLocation}
                  />
                </div>
                
                <div>
                  <div className="flex items-center mt-4 mb-2">
                    <h3 className="text-sm font-medium">Current Selected Location</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-sm p-2 bg-white/20 dark:bg-slate-700/20 rounded-md">
                    <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">
                      {formattedLocation.name} 
                      {formattedLocation.isCurrentLocation && " (Current Location)"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BellRing className="mr-2 h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weather-alerts">Weather Alerts</Label>
                    <CardDescription>
                      Receive notifications about severe weather conditions
                    </CardDescription>
                  </div>
                  <Switch 
                    id="weather-alerts"
                    checked={weatherAlerts}
                    onCheckedChange={handleToggleWeatherAlerts}
                  />
                </div>
                
                {weatherAlerts && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={sendTestNotification}
                    >
                      <Bell className="h-4 w-4" />
                      Test Notification
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your data and application preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Weather Data Cache</h3>
                      <p className="text-sm text-muted-foreground">
                        Clear cached weather data to fetch fresh information
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearCacheOnly}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Reset Application</h3>
                      <p className="text-sm text-muted-foreground">
                        Clear all settings, bookmarks, and cached data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={clearAppData}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.main>
        
        <footer className="mt-8 pt-4 text-sm text-center text-slate-500 dark:text-slate-400">
          <p>Developed by Faiz Nasir</p>
        </footer>
      </div>
    </div>
  );
}
