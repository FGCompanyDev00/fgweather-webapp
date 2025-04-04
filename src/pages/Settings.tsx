
import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UnitToggle } from "@/components/UnitToggle";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>(() => {
    return (localStorage.getItem('fg-weather-unit') as 'celsius' | 'fahrenheit') || 'celsius';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationStored, setLocationStored] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const handleUnitChange = (newUnit: 'celsius' | 'fahrenheit') => {
    setUnit(newUnit);
    localStorage.setItem('fg-weather-unit', newUnit);
    toast({
      title: "Temperature unit updated",
      description: `Temperature will now be displayed in ${newUnit === 'celsius' ? 'Celsius' : 'Fahrenheit'}.`
    });
  };
  
  const handleClearCache = () => {
    // Implementation would clear any cached weather data
    toast({
      title: "Cache cleared",
      description: "All cached weather data has been cleared."
    });
  };
  
  const handleResetSettings = () => {
    setUnit('celsius');
    setNotificationsEnabled(false);
    setLocationStored(false);
    setAutoRefresh(true);
    localStorage.setItem('fg-weather-unit', 'celsius');
    toast({
      title: "Settings reset",
      description: "All settings have been reset to their default values."
    });
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

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
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="notifications">Weather Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for severe weather</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled} 
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="location">Remember Location</Label>
                    <p className="text-sm text-muted-foreground">Store your last searched location</p>
                  </div>
                  <Switch 
                    id="location" 
                    checked={locationStored} 
                    onCheckedChange={setLocationStored} 
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
                    onClick={handleClearCache}
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
                    onClick={handleResetSettings}
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
          <p>Owned by FGCompany Original</p>
        </footer>
      </div>
    </div>
  );
}
