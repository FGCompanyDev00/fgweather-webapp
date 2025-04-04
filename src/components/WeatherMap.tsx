
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherMapProps {
  mapType: string;
  unit: 'celsius' | 'fahrenheit';
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

export function WeatherMap({ mapType, unit, location }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weatherMap', location.lat, location.lon, mapType],
    queryFn: async () => {
      // This is a mock function since we're using the free OpenWeatherMap tile layers
      // In a real implementation, you might fetch data from an API here
      return { success: true };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize map if it doesn't exist
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([location.lat, location.lon], 5);
      
      // Add base map layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
      
      // Add marker for the location
      L.marker([location.lat, location.lon])
        .addTo(leafletMap.current)
        .bindPopup(location.name)
        .openPopup();
    } else {
      // Update map view if location changes
      leafletMap.current.setView([location.lat, location.lon], 5);
      
      // Update marker position
      leafletMap.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          leafletMap.current?.removeLayer(layer);
        }
      });
      
      L.marker([location.lat, location.lon])
        .addTo(leafletMap.current)
        .bindPopup(location.name)
        .openPopup();
    }

    // Clean up and add new weather layer based on mapType
    if (tileLayer.current) {
      leafletMap.current.removeLayer(tileLayer.current);
    }
    
    // Different weather tile layers based on mapType
    // Note: Using free OpenWeatherMap tile layers which require API key
    // For demonstration, you can replace YOUR_API_KEY with a real key
    const openWeatherMapKey = "YOUR_API_KEY"; // In a real app, you'd use environment variables
    
    let weatherTileUrl = '';
    switch (mapType) {
      case 'temp':
        weatherTileUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherMapKey}`;
        break;
      case 'precipitation':
        weatherTileUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherMapKey}`;
        break;
      case 'clouds':
        weatherTileUrl = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherMapKey}`;
        break;
      case 'wind':
        weatherTileUrl = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherMapKey}`;
        break;
      default:
        weatherTileUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherMapKey}`;
    }
    
    // For demo purposes, since we don't have a real API key, we'll use a basic map layer
    // In a production app, you would use the weatherTileUrl with your API key
    tileLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap.current);
    
    // Add colored circles to represent weather data on the map
    const addMockWeatherData = () => {
      // Mock data points to simulate weather data
      const mockPoints = [
        { lat: location.lat + 2, lon: location.lon + 2, value: 25 }, // warm
        { lat: location.lat - 2, lon: location.lon - 2, value: 5 }, // cold
        { lat: location.lat + 1, lon: location.lon - 1, value: 15 }, // mild
        { lat: location.lat - 1, lon: location.lon + 1, value: 30 }, // hot
      ];
      
      mockPoints.forEach(point => {
        let color = 'green';
        let radius = 30000;
        
        // Determine color and radius based on mapType and value
        if (mapType === 'temp') {
          if (point.value < 0) color = 'blue';
          else if (point.value < 15) color = 'green';
          else if (point.value < 30) color = 'yellow';
          else color = 'red';
        }
        else if (mapType === 'precipitation') {
          radius = point.value * 5000;
          if (point.value < 1) color = 'rgba(173, 216, 230, 0.5)';  // light blue
          else if (point.value < 5) color = 'rgba(70, 130, 180, 0.5)'; // steel blue
          else if (point.value < 10) color = 'rgba(0, 0, 255, 0.5)'; // blue
          else color = 'rgba(0, 0, 139, 0.5)'; // dark blue
        }
        
        L.circle([point.lat, point.lon], {
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          radius: radius
        }).addTo(leafletMap.current!);
      });
    };
    
    addMockWeatherData();
    
    // Update map size when the component mounts
    leafletMap.current.invalidateSize();
    
    return () => {
      // No need to destroy the map on each render
    };
  }, [location, mapType, unit]);

  if (error) {
    toast.error("Failed to load weather map data");
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-slate-800/50 backdrop-blur-sm z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg z-0"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
}
