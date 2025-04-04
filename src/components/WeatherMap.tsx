
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const leafletMap = useRef<any>(null);
  const tileLayer = useRef<any>(null);

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weatherMap', location.lat, location.lon, mapType],
    queryFn: async () => {
      // This is a mock function since we're using visualization with circles
      return { success: true };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  useEffect(() => {
    // Dynamic import of leaflet to ensure it's only loaded in the browser
    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        if (!mapRef.current) return;
        
        // Initialize map if it doesn't exist
        if (!leafletMap.current) {
          leafletMap.current = L.map(mapRef.current).setView([location.lat, location.lon], 5);
          
          // Add base map layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Developed by Faiz Nasir | Owned by FGCompany Original'
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
          leafletMap.current.eachLayer((layer: any) => {
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
        
        // For demo purposes, we'll use a basic map layer and overlay data visualization
        tileLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Developed by Faiz Nasir | Owned by FGCompany Original'
        }).addTo(leafletMap.current);
        
        // Add colored circles to represent weather data on the map
        const addMockWeatherData = () => {
          // Clear any existing weather data circles
          leafletMap.current?.eachLayer((layer: any) => {
            if (layer instanceof L.Circle) {
              leafletMap.current?.removeLayer(layer);
            }
          });
          
          // Generate grid of points around the location
          const gridPoints = [];
          const gridSize = 5;
          const gridSpacing = 0.5; // in degrees
          
          for (let i = -gridSize; i <= gridSize; i++) {
            for (let j = -gridSize; j <= gridSize; j++) {
              // Generate realistic mock data values based on mapType and location
              let value;
              switch (mapType) {
                case 'temp':
                  // Temperature decreases with latitude and random variations
                  value = 20 - Math.abs(location.lat / 4) + Math.random() * 15 - 5;
                  break;
                case 'precipitation':
                  // Random precipitation with higher chance in certain regions
                  value = Math.random() * 12 * (Math.abs(Math.sin(location.lat / 10)) + 0.5);
                  break;
                case 'clouds':
                  // Cloud coverage percent
                  value = Math.random() * 100;
                  break;
                case 'wind':
                  // Wind speed in km/h
                  value = 5 + Math.random() * 35;
                  break;
                default:
                  value = 20;
              }
              
              gridPoints.push({
                lat: location.lat + i * gridSpacing,
                lon: location.lon + j * gridSpacing,
                value: value
              });
            }
          }
          
          // Add circles for each point
          gridPoints.forEach(point => {
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
            else if (mapType === 'clouds') {
              if (point.value < 10) color = 'rgba(135, 206, 250, 0.3)';  // clear sky
              else if (point.value < 50) color = 'rgba(192, 192, 192, 0.5)'; // partly cloudy
              else if (point.value < 90) color = 'rgba(128, 128, 128, 0.5)'; // mostly cloudy
              else color = 'rgba(90, 90, 90, 0.5)'; // overcast
            }
            else if (mapType === 'wind') {
              if (point.value < 5) color = 'rgba(144, 238, 144, 0.5)';  // calm
              else if (point.value < 15) color = 'rgba(50, 205, 50, 0.5)'; // light
              else if (point.value < 30) color = 'rgba(255, 215, 0, 0.5)'; // moderate
              else color = 'rgba(255, 0, 0, 0.5)'; // strong
            }
            
            L.circle([point.lat, point.lon], {
              color: color,
              fillColor: color,
              fillOpacity: 0.5,
              radius: radius
            }).addTo(leafletMap.current);
          });
        };
        
        addMockWeatherData();
        
        // Update map size when the component mounts
        leafletMap.current.invalidateSize();

      } catch (error) {
        console.error("Error initializing map:", error);
        toast.error("Failed to load map. Please refresh the page.");
      }
    };

    initializeMap();
    
    // Cleanup function
    return () => {
      if (leafletMap.current) {
        try {
          leafletMap.current.remove();
          leafletMap.current = null;
        } catch (e) {
          console.error("Error removing map:", e);
        }
      }
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
