
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function WeatherMap() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
            <CardHeader>
              <CardTitle>Weather Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[70vh]">
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Weather map feature coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </motion.main>
        
        <footer className="mt-8 pt-4 text-sm text-center text-white/70 dark:text-slate-400">
          <p>Powered by Open-Meteo Weather API</p>
        </footer>
      </div>
    </div>
  );
}
