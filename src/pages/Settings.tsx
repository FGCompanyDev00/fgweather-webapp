import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UnitToggle } from "@/components/UnitToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, RefreshCw, Info, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/App";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { 
  Loader2, 
  BellRing,
  BellOff,
  AlertTriangle
} from "lucide-react";
import { WeatherUnit } from "@/lib/utils/weather-api";

// Notification types
interface WeatherAlertSettings {
  enabled: boolean;
  interval: number; // in minutes
  lastAlertTime?: number;
}

// Service worker for app notifications
let notificationOptions: NotificationOptions;

export default function Settings() {
  const { toast } = useToast();
  const { setIsLoading } = useLoading();
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  
  // Load settings from localStorage
  const [unit, setUnit] = useState<WeatherUnit>(() => {
    return localStorage.getItem('fg-weather-unit') as WeatherUnit || 'celsius';
  });
  
  const [rememberLocation, setRememberLocation] = useState(() => {
    return localStorage.getItem('fg-weather-remember-location') === 'true';
  });
  
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('fg-weather-auto-refresh') === 'true';
  });
  
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlertSettings>(() => {
    const savedAlerts = localStorage.getItem('fg-weather-alerts');
    if (savedAlerts) {
      try {
        return JSON.parse(savedAlerts);
      } catch (e) {
        return { enabled: false, interval: 60 };
      }
    }
    return { enabled: false, interval: 60 };
  });
  
  // Check notifications support and permission on mount
  useEffect(() => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      setNotificationSupported(false);
      return;
    }
    
    // Get current notification permission
    setNotificationPermission(Notification.permission);
    
    // If already denied but alerts are enabled, disable them
    if (Notification.permission === 'denied' && weatherAlerts.enabled) {
      setWeatherAlerts(prev => ({ ...prev, enabled: false }));
      toast({
        title: "Weather alerts disabled",
        description: "Notification permission was denied. Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Save user preferences
  useEffect(() => {
    localStorage.setItem('fg-weather-unit', unit);
  }, [unit]);
  
  useEffect(() => {
    localStorage.setItem('fg-weather-remember-location', rememberLocation.toString());
    
    // If remember location is turned off, clear stored location
    if (!rememberLocation) {
      localStorage.removeItem('fg-weather-coordinates');
      localStorage.removeItem('fg-weather-location-name');
    }
  }, [rememberLocation]);
  
  useEffect(() => {
    localStorage.setItem('fg-weather-auto-refresh', autoRefresh.toString());
  }, [autoRefresh]);
  
  useEffect(() => {
    localStorage.setItem('fg-weather-alerts', JSON.stringify(weatherAlerts));
  }, [weatherAlerts]);
  
  // Setup weather alerts if enabled
  useEffect(() => {
    let alertInterval: number | undefined;
    
    const checkAndSendNotification = async () => {
      // Skip if alerts are disabled or notification permission not granted
      if (!weatherAlerts.enabled || Notification.permission !== 'granted') {
        return;
      }
      
      const lastCheck = weatherAlerts.lastAlertTime || 0;
      const now = Date.now();
      const intervalMs = weatherAlerts.interval * 60 * 1000;
      
      // Check if it's time for a new alert
      if (now - lastCheck >= intervalMs) {
        // Update the last alert time
        setWeatherAlerts(prev => ({
          ...prev,
          lastAlertTime: now
        }));
        
        // Get current location or use saved location
        const coordinates = localStorage.getItem('fg-weather-coordinates');
        const locationName = localStorage.getItem('fg-weather-location-name') || 'your location';
        
        if (coordinates) {
          try {
            // Fetch latest weather and send notification
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${JSON.parse(coordinates).latitude}&longitude=${JSON.parse(coordinates).longitude}&current=temperature_2m,weather_code,precipitation&timezone=auto`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch weather data');
            }
            
            const data = await response.json();
            
            // Create a more informative notification
            let message = `Current temperature at ${locationName}: ${Math.round(data.current.temperature_2m)}°${unit === 'celsius' ? 'C' : 'F'}`;
            
            // Add precipitation info if available
            if (data.current.precipitation > 0) {
              message += ` | Precipitation: ${data.current.precipitation}mm`;
            }
            
            // Get weather code description
            const weatherCode = data.current.weather_code;
            let weatherDescription = '';
            
            if (weatherCode === 0) weatherDescription = 'Clear sky';
            else if (weatherCode >= 1 && weatherCode <= 3) weatherDescription = 'Partly cloudy';
            else if (weatherCode >= 45 && weatherCode <= 48) weatherDescription = 'Fog';
            else if (weatherCode >= 51 && weatherCode <= 55) weatherDescription = 'Drizzle';
            else if (weatherCode >= 61 && weatherCode <= 65) weatherDescription = 'Rain';
            else if (weatherCode >= 71 && weatherCode <= 77) weatherDescription = 'Snow';
            else if (weatherCode >= 80 && weatherCode <= 82) weatherDescription = 'Rain showers';
            else if (weatherCode >= 85 && weatherCode <= 86) weatherDescription = 'Snow showers';
            else if (weatherCode >= 95 && weatherCode <= 99) weatherDescription = 'Thunderstorm';
            
            if (weatherDescription) {
              message += ` | ${weatherDescription}`;
            }
            
            // Create notification without the vibrate property
            new Notification('Weather Update', {
              body: message,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              tag: 'weather-update' // Ensures only one notification is shown
            });
            
            console.log('Weather notification sent:', message);
          } catch (err) {
            console.error('Failed to fetch weather for notification:', err);
          }
        }
      }
    };
    
    if (weatherAlerts.enabled) {
      // Immediately check if notification is due
      checkAndSendNotification();
      
      // Setup interval to check for notifications (every minute)
      alertInterval = window.setInterval(checkAndSendNotification, 60000);
    }
    
    return () => {
      if (alertInterval) {
        clearInterval(alertInterval);
      }
    };
  }, [weatherAlerts, unit]);
  
  const handleUnitChange = (value: string) => {
    setUnit(value as WeatherUnit);
    toast({
      title: "Unit updated",
      description: `Temperature will now be displayed in ${value === 'celsius' ? 'Celsius' : 'Fahrenheit'}.`,
    });
  };
  
  const handleToggleWeatherAlerts = async () => {
    // If turning ON alerts
    if (!weatherAlerts.enabled) {
      // Check if notifications are supported
      if (!notificationSupported) {
        toast({
          title: "Notifications not supported",
          description: "Your browser does not support notifications.",
          variant: "destructive",
        });
        return;
      }
      
      // Request permission if not already granted
      if (Notification.permission !== 'granted') {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
          
          if (permission === 'granted') {
            // Enable alerts and send a test notification
            setWeatherAlerts(prev => ({ 
              ...prev, 
              enabled: true,
              lastAlertTime: Date.now() - (prev.interval * 60 * 1000) + (60 * 1000) // Set to trigger in 1 minute
            }));
            
            toast({
              title: "Weather alerts enabled",
              description: "You will receive your first weather update in about a minute.",
            });
            
            // Send immediate test notification without vibrate property
            new Notification('Weather Alerts Enabled', {
              body: 'You will receive hourly weather updates. This is a test notification.',
              icon: '/icons/icon-192x192.png'
            });
          } else {
            toast({
              title: "Permission denied",
              description: "You need to allow notifications to receive weather alerts.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          toast({
            title: "Permission error",
            description: "There was an error requesting notification permission.",
            variant: "destructive",
          });
        }
      } else {
        // Permission already granted, enable alerts
        setWeatherAlerts(prev => ({ 
          ...prev, 
          enabled: true,
          lastAlertTime: Date.now() - (prev.interval * 60 * 1000) + (60 * 1000) // Set to trigger in 1 minute
        }));
        
        toast({
          title: "Weather alerts enabled",
          description: "You will receive your first weather update in about a minute.",
        });
      }
    } else {
      // Turning OFF alerts
      setWeatherAlerts(prev => ({ ...prev, enabled: false }));
      toast({
        title: "Weather alerts disabled",
        description: "You will no longer receive weather updates.",
      });
    }
  };
  
  const handleAlertIntervalChange = (value: string) => {
    const interval = parseInt(value);
    setWeatherAlerts(prev => ({ 
      ...prev, 
      interval: interval,
      // Reset the last alert time to trigger a new notification soon
      lastAlertTime: Date.now() - (interval * 60 * 1000) + (2 * 60 * 1000) // Set to trigger in 2 minutes
    }));
    
    toast({
      title: "Alert interval updated",
      description: `Weather alerts will be sent every ${value} minutes.`,
    });
  };
  
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Permission granted",
          description: "You can now enable weather alerts.",
        });
        
        // Send a test notification without vibrate property
        new Notification('Notification Permission Granted', {
          body: 'You can now enable weather alerts in the settings.',
          icon: '/icons/icon-192x192.png'
        });
      } else {
        toast({
          title: permission === 'denied' ? "Permission denied" : "Permission not granted",
          description: permission === 'denied' 
            ? "Please enable notifications in your browser settings to use weather alerts." 
            : "You need to allow notifications to receive weather alerts.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Permission error",
        description: "There was an error requesting notification permission.",
        variant: "destructive",
      });
    }
  };
  
  const clearCache = () => {
    // Clear all cached API responses
    const cacheKeys = [
      'fg-weather-cache-recent',
      'fg-weather-cache-forecast',
      'fg-weather-cache-airquality'
    ];
    
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: "Cache cleared",
      description: "All weather data cache has been cleared.",
    });
  };
  
  const resetSettings = () => {
    // Reset to default settings
    setUnit('celsius');
    setRememberLocation(true);
    setAutoRefresh(true);
    setWeatherAlerts({ enabled: false, interval: 60 });
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Determine notification status message and icon
  const getNotificationStatus = () => {
    if (!notificationSupported) {
      return {
        message: "Notifications are not supported in your browser",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        color: "text-red-500"
      };
    }
    
    switch (notificationPermission) {
      case 'granted':
        return {
          message: "Notifications are enabled",
          icon: <BellRing className="h-5 w-5 text-green-500" />,
          color: "text-green-500"
        };
      case 'denied':
        return {
          message: "Notifications are blocked. Please update your browser settings.",
          icon: <BellOff className="h-5 w-5 text-red-500" />,
          color: "text-red-500"
        };
      default:
        return {
          message: "Notification permission not requested yet",
          icon: <Bell className="h-5 w-5 text-orange-500" />,
          color: "text-orange-500"
        };
    }
  };
  
  const notificationStatus = getNotificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <header className="flex flex-col space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">FGWeather</h1>
          </div>
          <Navigation />
        </header>
        
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Customize your weather experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance</h3>
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="unit">Temperature Unit</Label>
                    <p className="text-sm text-muted-foreground">Select your preferred temperature unit</p>
                  </div>
                  <UnitToggle unit={unit} onUnitChange={handleUnitChange} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                <Separator />
                
                {/* Notification Status */}
                <div className="flex items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-md mb-4">
                  {notificationStatus.icon}
                  <span className={`ml-2 text-sm ${notificationStatus.color}`}>
                    {notificationStatus.message}
                  </span>
                  
                  {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto"
                      onClick={requestNotificationPermission}
                    >
                      Request Permission
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="notifications">Weather Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for weather updates</p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={weatherAlerts.enabled} 
                      onCheckedChange={handleToggleWeatherAlerts}
                      disabled={!notificationSupported || notificationPermission === 'denied'}
                    />
                  </div>
                  
                  {weatherAlerts.enabled && (
                    <div className="pl-6 border-l-2 border-primary/20 mt-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="alertInterval">Alert Interval (minutes)</Label>
                        <Select value={weatherAlerts.interval.toString()} onValueChange={handleAlertIntervalChange}>
                          <SelectTrigger id="alertInterval">
                            <SelectValue placeholder="Select alert interval" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="180">3 hours</SelectItem>
                            <SelectItem value="360">6 hours</SelectItem>
                            <SelectItem value="720">12 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <BellRing className="inline-block mr-1 h-4 w-4" />
                        Next alert will be sent approximately {weatherAlerts.interval} minutes after the last one
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="location">Remember Location</Label>
                    <p className="text-sm text-muted-foreground">Store your last searched location</p>
                  </div>
                  <Switch 
                    id="location" 
                    checked={rememberLocation} 
                    onCheckedChange={setRememberLocation} 
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="auto-refresh">Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically update weather data</p>
                  </div>
                  <Switch 
                    id="auto-refresh" 
                    checked={autoRefresh} 
                    onCheckedChange={setAutoRefresh} 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Clear Cache</Label>
                    <p className="text-sm text-muted-foreground">Remove stored weather data</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearCache}
                    className="flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Reset Settings</Label>
                    <p className="text-sm text-muted-foreground">Restore default settings</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetSettings}
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 dark:bg-slate-700/50 rounded-lg flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  FGWeather uses Open-Meteo API to provide accurate weather forecasts. Your location data is only used to provide local weather information.
                </p>
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
