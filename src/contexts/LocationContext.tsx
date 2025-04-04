import React, { createContext, useContext, ReactNode } from 'react';
import { 
  LocationData, 
  useLocationData, 
  detectUserLocation,
  saveLocationToStorage,
  getDefaultLocation 
} from '@/lib/utils/location-utils';
import { toast } from 'sonner';

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  error: Error | null;
  updateLocation: (newLocation: LocationData) => void;
  refreshCurrentLocation: () => Promise<LocationData>;
}

// Create the context with a default value
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component that wraps the app and makes location data available
export function LocationProvider({ children }: { children: ReactNode }) {
  const { 
    locationData: location, 
    isLoading, 
    error, 
    updateLocation,
    refreshCurrentLocation: refresh 
  } = useLocationData();

  // Enhanced version of refreshCurrentLocation with better error handling and feedback
  const refreshCurrentLocation = async () => {
    try {
      const result = await refresh();
      toast.success(`Location updated to ${result.name}`);
      return result;
    } catch (err) {
      console.error("Failed to update location:", err);
      toast.error("Couldn't get your location. Using saved or default location.");
      
      // If we have a location already, keep using it
      // Otherwise fall back to default
      if (!location) {
        const defaultLocation = getDefaultLocation();
        updateLocation(defaultLocation);
        return defaultLocation;
      }
      
      return location;
    }
  };

  // Update location with a manually selected location
  const handleUpdateLocation = (newLocation: LocationData) => {
    updateLocation(newLocation);
    toast.success(`Location updated to ${newLocation.name}`);
  };

  // The value that will be available to consumers of this context
  const value = {
    location,
    isLoading,
    error,
    updateLocation: handleUpdateLocation,
    refreshCurrentLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook to use the location context
export function useLocation() {
  const context = useContext(LocationContext);
  
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  
  return context;
}

// Helper to convert LocationData to the format expected by the existing components
export function locationDataToComponentFormat(locationData: LocationData) {
  return {
    lat: locationData.latitude,
    lon: locationData.longitude,
    name: locationData.name,
    isCurrentLocation: locationData.isCurrentLocation
  };
}

// Helper to convert component location format to LocationData
export function componentFormatToLocationData(location: any): LocationData {
  return {
    latitude: location.lat,
    longitude: location.lon,
    name: location.name,
    isCurrentLocation: location.isCurrentLocation || false
  };
} 