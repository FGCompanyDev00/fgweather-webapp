import { useEffect, useRef, useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface WeatherMapProps {
  mapType: string;
  unit: 'celsius' | 'fahrenheit';
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

// Memoized component to prevent unnecessary re-renders
const WeatherMap = memo(({ mapType, unit, location }: WeatherMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const weatherLayer = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fetch weather data with React Query
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weatherMap', location.lat, location.lon, mapType],
    queryFn: async () => {
      try {
        // Use Open-Meteo API for weather data
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    
    // Initialize map
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false, // We'll add it in a better position
      attributionControl: false, // We'll add it manually for better styling
    }).setView([location.lat, location.lon], 6);
    
    // Add zoom control to the top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(leafletMap.current);
    
    // Add attribution with custom styling
    L.control.attribution({
      position: 'bottomright',
      prefix: '<a href="https://leafletjs.com" class="text-blue-500 hover:text-blue-700 dark:text-blue-400">Leaflet</a>'
    }).addTo(leafletMap.current);
    
    // Create a layer group for weather visualization
    weatherLayer.current = L.layerGroup().addTo(leafletMap.current);
    
    // Add base map layer with modern style
    tileLayer.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" class="text-blue-500 hover:text-blue-700 dark:text-blue-400">OpenStreetMap</a> | <a href="https://carto.com/attributions" class="text-blue-500 hover:text-blue-700 dark:text-blue-400">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(leafletMap.current);
    
    // Add a darker theme for dark mode
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const htmlElement = document.querySelector('html');
    
    const updateMapTheme = () => {
      if (!leafletMap.current || !tileLayer.current) return;
      
      const isDarkMode = htmlElement?.classList.contains('dark') || 
                         darkModeMedia.matches;
      
      // Remove current tile layer
      leafletMap.current.removeLayer(tileLayer.current);
      
      // Add appropriate tile layer based on theme
      if (isDarkMode) {
        tileLayer.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" class="text-blue-400 hover:text-blue-300">OpenStreetMap</a> | <a href="https://carto.com/attributions" class="text-blue-400 hover:text-blue-300">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(leafletMap.current);
      } else {
        tileLayer.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" class="text-blue-500 hover:text-blue-700">OpenStreetMap</a> | <a href="https://carto.com/attributions" class="text-blue-500 hover:text-blue-700">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(leafletMap.current);
      }
    };
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      updateMapTheme();
    });
    
    if (htmlElement) {
      observer.observe(htmlElement, { attributes: true });
    }
    
    // Initial marker
    markerRef.current = L.marker([location.lat, location.lon], {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin bg-blue-600 shadow-lg flex items-center justify-center w-6 h-6 rounded-full border-2 border-white">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      })
    }).addTo(leafletMap.current);
    
    markerRef.current.bindPopup(`<div class="text-center font-medium">${location.name}</div>`).openPopup();
    
    setIsMapReady(true);
    
    return () => {
      // Clean up on unmount
      observer.disconnect();
    };
  }, []);

  // Update map center and marker when location changes
  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return;
    
    // Update map view with animation
    leafletMap.current.flyTo([location.lat, location.lon], 6, {
      duration: 1.5, // Animation duration in seconds
    });
    
    // Update marker position and popup
    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      markerRef.current.setPopupContent(`<div class="text-center font-medium">${location.name}</div>`);
      markerRef.current.openPopup();
    }
  }, [location, isMapReady]);

  // Update weather visualization when weatherData or mapType changes
  useEffect(() => {
    if (!leafletMap.current || !isMapReady || isLoading || !weatherData) return;
    
    // Clear previous weather visualization
    if (weatherLayer.current) {
      weatherLayer.current.clearLayers();
    } else {
      weatherLayer.current = L.layerGroup().addTo(leafletMap.current);
    }
    
    // Create visualization based on mapType
    const visualizeWeatherData = () => {
      if (!weatherLayer.current) return;
      
      // Create a heat-map style visualization
      // For actual implementation, we'd generate points based on real data
      // Here we're generating a simplified view using the API data
      
      // Generate grid of points around the selected location
      const gridSize = 10;
      const radius = 2; // degrees
      const points = [];
      
      for (let i = -gridSize; i <= gridSize; i++) {
        for (let j = -gridSize; j <= gridSize; j++) {
          const pointLat = location.lat + (i * radius / gridSize);
          const pointLon = location.lon + (j * radius / gridSize);
          
          // Skip points too far from center
          if (Math.sqrt(i*i + j*j) > gridSize) continue;
          
          // Base value on the selected data type, with random variation to simulate a real map
          let value;
          const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 range for variation
          
          switch (mapType) {
            case 'temp':
              // Temperature scaled by distance from center and random factor
              const baseTemp = weatherData.current.temperature_2m;
              const distanceFactor = 1 - (Math.sqrt(i*i + j*j) / gridSize) * 0.4; // Closer points more similar
              value = baseTemp * distanceFactor * randomFactor;
              break;
            
            case 'precipitation':
              // Precipitation with clusters
              const basePrecip = weatherData.current.precipitation || 0;
              value = basePrecip * Math.pow(randomFactor, 3) * (Math.random() > 0.7 ? 3 : 1);
              break;
            
            case 'clouds':
              // Cloud cover percentage
              const cloudCover = weatherData.current.cloud_cover || 0;
              value = cloudCover * randomFactor;
              break;
            
            case 'wind':
              // Wind speed
              const windSpeed = weatherData.current.wind_speed_10m || 0;
              value = windSpeed * randomFactor;
              break;
            
            default:
              value = 0;
          }
          
          points.push({ lat: pointLat, lon: pointLon, value });
        }
      }
      
      // Render points with colors and sizes based on values
      points.forEach(point => {
        let color = 'blue';
        let opacity = 0.5;
        let radius = 15000;
        
        // Set visualization properties based on mapType and value
        if (mapType === 'temp') {
          // Temperature visualization (blue to red)
          if (unit === 'fahrenheit') {
            // Convert to Fahrenheit for scale calculation
            point.value = (point.value * 9/5) + 32;
          }
          
          if (point.value < 0) {
            color = 'rgb(0, 50, 200)';
            opacity = 0.6;
          } else if (point.value < 10) {
            color = 'rgb(30, 100, 255)';
            opacity = 0.6;
          } else if (point.value < 20) {
            color = 'rgb(50, 150, 255)';
            opacity = 0.5;
          } else if (point.value < 25) {
            color = 'rgb(100, 200, 50)';
            opacity = 0.5;
          } else if (point.value < 30) {
            color = 'rgb(255, 200, 0)';
            opacity = 0.6;
          } else if (point.value < 35) {
            color = 'rgb(255, 100, 0)';
            opacity = 0.7;
          } else {
            color = 'rgb(200, 0, 0)';
            opacity = 0.7;
          }
          
          radius = 20000 + (point.value * 500);
        }
        else if (mapType === 'precipitation') {
          // Precipitation visualization (light to dark blue)
          radius = 15000 + (point.value * 2000);
          
          if (point.value === 0) {
            // No precipitation
            return; // Skip rendering
          } else if (point.value < 0.5) {
            color = 'rgba(200, 220, 255, 0.6)';
            opacity = 0.4;
          } else if (point.value < 2) {
            color = 'rgba(100, 150, 255, 0.7)';
            opacity = 0.5;
          } else if (point.value < 5) {
            color = 'rgba(50, 100, 255, 0.8)';
            opacity = 0.6;
          } else {
            color = 'rgba(20, 50, 200, 0.9)';
            opacity = 0.7;
          }
        }
        else if (mapType === 'clouds') {
          // Cloud cover visualization (white to gray)
          if (point.value < 10) {
            // Almost no clouds
            return; // Skip rendering for clear sky
          } else if (point.value < 30) {
            color = 'rgba(220, 220, 220, 0.7)';
            opacity = 0.3;
          } else if (point.value < 60) {
            color = 'rgba(180, 180, 180, 0.8)';
            opacity = 0.4;
          } else if (point.value < 85) {
            color = 'rgba(150, 150, 150, 0.8)';
            opacity = 0.5;
          } else {
            color = 'rgba(100, 100, 100, 0.9)';
            opacity = 0.6;
          }
          
          radius = 20000 + (point.value * 200);
        }
        else if (mapType === 'wind') {
          // Wind speed visualization (green to red)
          if (point.value < 5) {
            color = 'rgba(100, 200, 100, 0.6)';
            opacity = 0.4;
          } else if (point.value < 15) {
            color = 'rgba(150, 200, 50, 0.7)';
            opacity = 0.5;
          } else if (point.value < 30) {
            color = 'rgba(255, 200, 0, 0.8)';
            opacity = 0.6;
          } else {
            color = 'rgba(255, 50, 0, 0.9)';
            opacity = 0.7;
          }
          
          radius = 15000 + (point.value * 1000);
        }
        
        // Create circle
        L.circle([point.lat, point.lon], {
          color: 'transparent',
          fillColor: color,
          fillOpacity: opacity,
          radius: radius
        }).addTo(weatherLayer.current!);
      });
    };
    
    visualizeWeatherData();
    
    // Update map size to prevent rendering issues
    leafletMap.current.invalidateSize();
    
  }, [weatherData, mapType, unit, location, isMapReady, isLoading]);

  if (error) {
    toast.error("Failed to load weather map data");
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/50 dark:bg-slate-800/50 backdrop-blur-sm z-10">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-opacity-50 border-t-blue-600 rounded-full mb-2"></div>
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full z-0 transition-opacity duration-300"
        style={{ 
          minHeight: "500px",
          opacity: isLoading ? 0.6 : 1
        }}
      />
      
      {/* Map overlay info */}
      <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 hover:bg-white dark:hover:bg-slate-800">
        <div className="text-sm font-medium">
          {weatherData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-base font-semibold">Current Weather</p>
              <p>Temp: {weatherData.current.temperature_2m}°{unit === 'celsius' ? 'C' : 'F'}</p>
              {weatherData.current.precipitation > 0 && (
                <p>Precipitation: {weatherData.current.precipitation} mm</p>
              )}
              <p>Wind: {weatherData.current.wind_speed_10m} km/h</p>
              <p>Clouds: {weatherData.current.cloud_cover}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});

WeatherMap.displayName = "WeatherMap";

export { WeatherMap };
