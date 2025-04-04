import { useEffect, useRef, useState, memo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { fetchWeatherDataOptimized } from "@/lib/utils/weather-api";

interface WeatherMapProps {
  mapType: string;
  unit: 'celsius' | 'fahrenheit';
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  onLoaded?: () => void;
  onError?: (message: string) => void;
}

// Memoized component to prevent unnecessary re-renders
const WeatherMap = memo(({ mapType, unit, location, onLoaded, onError }: WeatherMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const weatherLayer = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const queryClient = useQueryClient();
  
  // Load map tiles with reduced quality initially for faster loading
  const [highQualityTiles, setHighQualityTiles] = useState(false);
  
  // Prefetch nearby locations weather data
  const prefetchNearbyLocations = useCallback(() => {
    if (!location) return;
    
    // Create a grid of nearby locations to prefetch
    const offsets = [0.5, -0.5, 1, -1];
    offsets.forEach(latOffset => {
      offsets.forEach(lonOffset => {
        if (latOffset === 0 && lonOffset === 0) return; // Skip current location
        
        const nearbyLat = location.lat + latOffset;
        const nearbyLon = location.lon + lonOffset;
        
        // Prefetch weather data for nearby location
        queryClient.prefetchQuery({
          queryKey: ['weatherMap', nearbyLat.toFixed(2), nearbyLon.toFixed(2), mapType],
          queryFn: async () => {
            try {
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${nearbyLat}&longitude=${nearbyLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
              );
              
              if (!response.ok) {
                throw new Error('Failed to fetch nearby weather data');
              }
              
              return await response.json();
            } catch (error) {
              // Silently fail for prefetch
              return null;
            }
          },
          staleTime: 1000 * 60 * 15, // 15 minutes
        });
      });
    });
  }, [location, mapType, queryClient]);

  // Fetch weather data with React Query
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weatherMap', location.lat.toFixed(2), location.lon.toFixed(2), mapType],
    queryFn: async () => {
      try {
        // Use optimized weather API with built-in caching
        const data = await fetchWeatherDataOptimized(
          location.lat,
          location.lon
        );
        
        // After successful fetch, prefetch nearby locations
        setTimeout(() => prefetchNearbyLocations(), 1000);
        
        return data;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        if (onError) onError('Failed to load weather data');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
  });

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    
    // Initialize map with faster loading settings
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false, // We'll add it in a better position
      attributionControl: false, // We'll add it manually for better styling
      preferCanvas: true, // Use canvas for faster rendering
      renderer: L.canvas({ padding: 0.5 }), // Configure canvas renderer
      fadeAnimation: false, // Disable animations initially for faster loading
      zoomAnimation: false, // Disable animations initially for faster loading
      markerZoomAnimation: false, // Disable animations initially for faster loading
    }).setView([location.lat, location.lon], 5); // Start with lower zoom for faster loading
    
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
    
    // Function to update tile layer based on theme
    const updateMapTheme = (isDarkMode: boolean, highQuality: boolean = false) => {
      if (!leafletMap.current) return;
      
      // Remove current tile layer if exists
      if (tileLayer.current) {
        leafletMap.current.removeLayer(tileLayer.current);
      }
      
      // Choose tile URL based on quality and theme
      const quality = highQuality ? '' : '{r}';
      const tileUrl = isDarkMode
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}${quality}.png`
        : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}${quality}.png`;
      
      // Add appropriate tile layer based on theme
      tileLayer.current = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" class="text-blue-500 hover:text-blue-700 dark:text-blue-400">OpenStreetMap</a> | <a href="https://carto.com/attributions" class="text-blue-500 hover:text-blue-700 dark:text-blue-400">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 3,
        tileSize: 256, // Smaller tile size for faster loading
        updateWhenIdle: true, // Only load tiles when panning/zooming is complete
        keepBuffer: 2, // Keep fewer tiles in memory
      }).addTo(leafletMap.current);
    };
    
    // Get dark mode state
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const htmlElement = document.querySelector('html');
    const isDarkMode = htmlElement?.classList.contains('dark') || darkModeMedia.matches;
    
    // Start with lower quality tiles for faster loading
    updateMapTheme(isDarkMode, false);
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDarkMode = htmlElement?.classList.contains('dark') || darkModeMedia.matches;
      updateMapTheme(isDarkMode, highQualityTiles);
    });
    
    if (htmlElement) {
      observer.observe(htmlElement, { attributes: true });
    }
    
    // Initial marker with simplified icon
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
    
    // Add simple popup with just text initially
    markerRef.current.bindPopup(location.name).openPopup();
    
    // Mark map as ready
    setIsMapReady(true);
    
    // After a delay, switch to high quality tiles and enable animations
    setTimeout(() => {
      if (leafletMap.current) {
        setHighQualityTiles(true);
        updateMapTheme(isDarkMode, true);
        
        // Re-enable animations
        leafletMap.current.options.fadeAnimation = true;
        leafletMap.current.options.zoomAnimation = true;
        leafletMap.current.options.markerZoomAnimation = true;
        
        // Adjust zoom level to show more detail
        leafletMap.current.setZoom(6);
        
        // Update the popup with better formatting
        if (markerRef.current) {
          markerRef.current.setPopupContent(`<div class="text-center font-medium">${location.name}</div>`);
        }
        
        // Notify parent component that map is fully loaded
        if (onLoaded) onLoaded();
      }
    }, 1500);
    
    return () => {
      // Clean up on unmount
      observer.disconnect();
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [location.lat, location.lon, location.name, onLoaded]);

  // Update map center and marker when location changes
  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return;
    
    // Update map view with animation
    leafletMap.current.flyTo([location.lat, location.lon], leafletMap.current.getZoom(), {
      duration: 1, // Shorter animation duration
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
      
      // Create a heat-map style visualization with fewer points for better performance
      // Reduce grid size for initial load
      const gridSize = 8; // Reduced grid size
      const radius = 2; // degrees
      const points = [];
      
      // Calculate grid points with improved performance
      for (let i = -gridSize; i <= gridSize; i += 1) {
        for (let j = -gridSize; j <= gridSize; j += 1) {
          // Skip points that would be too close to others (reduce density)
          if ((i % 2 !== 0 || j % 2 !== 0) && Math.abs(i) + Math.abs(j) > 3) continue;
          
          const pointLat = location.lat + (i * radius / gridSize);
          const pointLon = location.lon + (j * radius / gridSize);
          
          // Skip points too far from center
          if (Math.sqrt(i*i + j*j) > gridSize) continue;
          
          // Base value on the selected data type, with simplified random variation
          let value;
          // Use a simpler random factor calculation
          const randomFactor = 0.8 + (Math.random() * 0.4);
          
          switch (mapType) {
            case 'temperature':
              // Temperature scaled by distance from center and random factor
              const baseTemp = weatherData.current.temperature_2m;
              const distanceFactor = 1 - (Math.sqrt(i*i + j*j) / gridSize) * 0.4;
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
      
      // Use a more efficient rendering method by batching the circles into fewer layer additions
      const layers: L.Circle[] = [];
      
      // Render points with colors and sizes based on values
      points.forEach(point => {
        let color = 'blue';
        let opacity = 0.5;
        let radius = 15000;
        
        // Set visualization properties based on mapType and value
        if (mapType === 'temperature') {
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
            color = 'rgb(90, 160, 255)';
            opacity = 0.6;
          } else if (point.value < 25) {
            color = 'rgb(160, 200, 255)';
            opacity = 0.5;
          } else if (point.value < 30) {
            color = 'rgb(255, 230, 180)';
            opacity = 0.5;
          } else if (point.value < 35) {
            color = 'rgb(255, 190, 130)';
            opacity = 0.6;
          } else if (point.value < 40) {
            color = 'rgb(255, 120, 50)';
            opacity = 0.7;
          } else {
            color = 'rgb(225, 50, 0)';
            opacity = 0.8;
          }
          
          radius = 15000 + (Math.abs(point.value) * 300);
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
        const circle = L.circle([point.lat, point.lon], {
          color: 'transparent',
          fillColor: color,
          fillOpacity: opacity,
          radius: radius,
          renderer: leafletMap.current?.options.renderer // Use canvas renderer
        });
        
        layers.push(circle);
      });
      
      // Add all circles at once for better performance
      if (weatherLayer.current) {
        const layerGroup = L.layerGroup(layers);
        weatherLayer.current.addLayer(layerGroup);
      }
    };
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => visualizeWeatherData());
    
    // Update map size to prevent rendering issues
    if (leafletMap.current) {
      leafletMap.current.invalidateSize();
    }
    
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
      
      {/* Map overlay info - render only when data is available */}
      {weatherData && (
        <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 hover:bg-white dark:hover:bg-slate-800">
          <div className="text-sm font-medium">
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
          </div>
        </div>
      )}
    </div>
  );
});

WeatherMap.displayName = "WeatherMap";

export { WeatherMap };
