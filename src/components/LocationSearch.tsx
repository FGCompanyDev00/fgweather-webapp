import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeocodingResult, searchLocation } from '@/lib/utils/weather-api';
import { useToast } from "@/hooks/use-toast";
import { useLoading } from '@/App';
import debounce from 'lodash.debounce';

interface LocationSearchProps {
  onSelectLocation?: (location: GeocodingResult) => void;
  onUseCurrentLocation?: () => void;
  isLoadingLocation?: boolean;
  // For AirQuality page
  onLocationChange?: (location: { lat: number; lon: number; name: string }) => void;
}

export function LocationSearch({ 
  onSelectLocation, 
  onUseCurrentLocation,
  isLoadingLocation = false,
  onLocationChange
}: LocationSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState<boolean>(() => {
    return localStorage.getItem('fg-weather-is-current-location') === 'true';
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { setIsLoading, setLoadingMessage } = useLoading();
  
  // Use debounce for search to improve performance
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const searchResults = await searchLocation(searchQuery);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        toast({
          title: "Search Error",
          description: "Failed to find location. Please try again.",
          variant: "destructive",
        });
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [toast]
  );

  // Update search when query changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setShowResults(false);
    }
    
    // Cleanup the debounced function on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  // Check if current location status changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsUsingCurrentLocation(localStorage.getItem('fg-weather-is-current-location') === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSelectLocation = (location: GeocodingResult) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
    
    if (onLocationChange) {
      onLocationChange({
        lat: location.latitude,
        lon: location.longitude,
        name: location.name
      });
    }
    
    setQuery('');
    setResults([]);
    setShowResults(false);
    setIsUsingCurrentLocation(false); // No longer using current location
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      debouncedSearch.flush(); // Immediately execute the debounced search
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };
  
  const handleCurrentLocation = async () => {
    setIsLoading(true);
    setLoadingMessage("Getting your location...");
    
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
      setIsUsingCurrentLocation(true);
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row items-center w-full gap-2">
        <div className="relative flex-grow w-full">
          <Input
            className="pl-10 pr-10 py-6 rounded-full focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button 
            variant={isUsingCurrentLocation ? "default" : "outline"}
            size="icon"
            className="rounded-full aspect-square h-10 flex-shrink-0"
            onClick={handleCurrentLocation}
            disabled={isLoadingLocation}
            title="Use current location"
          >
            {isLoadingLocation ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            className="rounded-full px-4 py-6 flex-1 sm:flex-initial"
            onClick={() => debouncedSearch.flush()}
            disabled={!query.trim() || isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>
      </div>
      
      {showResults && results.length > 0 && (
        <div className="absolute mt-2 w-full z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
          <ScrollArea className="h-auto max-h-64">
            <div>
              {results.map((result, index) => (
                <button
                  key={`${result.name}-${result.latitude}-${result.longitude}`}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start"
                  onClick={() => handleSelectLocation(result)}
                >
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {[result.admin1, result.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {showResults && query && results.length === 0 && !isSearching && (
        <div className="absolute mt-2 w-full z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 text-center">
          No locations found for "{query}"
        </div>
      )}
    </div>
  );
}
