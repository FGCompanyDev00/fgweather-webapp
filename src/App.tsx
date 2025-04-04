import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/utils/theme-provider";
import { AnimatePresence } from "framer-motion";
import { createContext, useState, useContext, ReactNode } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WeatherMap from "./pages/WeatherMap";
import AirQuality from "./pages/AirQuality";
import Settings from "./pages/Settings";
import WeatherNews from "./pages/WeatherNews";
import { GlobalLoadingIndicator } from "./components/GlobalLoadingIndicator";
import { LocationProvider } from "@/contexts/LocationContext";

// Create a loading context to manage global loading state
interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

export const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
  loadingMessage: "",
  setLoadingMessage: () => {},
});

export const useLoading = () => useContext(LoadingContext);

const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, loadingMessage, setLoadingMessage }}>
      {children}
      {isLoading && <GlobalLoadingIndicator message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 1000 * 60 * 10, // 10 minutes - increase cache time to improve performance
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnMount: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="fg-weather-theme">
      <TooltipProvider>
        <LoadingProvider>
          <LocationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {/* Preload critical assets */}
              <link rel="preload" href="/assets/weather-default.jpg" as="image" />
              <link rel="preload" href="https://a.basemaps.cartocdn.com/light_all/5/15/12.png" as="image" />
              <link rel="dns-prefetch" href="https://api.open-meteo.com" />
              <link rel="dns-prefetch" href="https://geocoding-api.open-meteo.com" />
              
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/map" element={<WeatherMap />} />
                  <Route path="/air-quality" element={<AirQuality />} />
                  <Route path="/news" element={<WeatherNews />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </LocationProvider>
        </LoadingProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
