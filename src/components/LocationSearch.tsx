
import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeocodingResult, searchLocation } from '@/lib/utils/weather-api';
import { useToast } from "@/hooks/use-toast";

interface LocationSearchProps {
  onLocationChange: (location: { lat: number; lon: number; name: string }) => void;
  onUseCurrentLocation?: () => void;
  isLoadingLocation?: boolean;
}

export function LocationSearch({ 
  onLocationChange, 
  onUseCurrentLocation,
  isLoadingLocation = false
}: LocationSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await searchLocation(query);
      setResults(searchResults);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to find location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setShowResults(true);
    }
  };

  const handleSelectLocation = (location: GeocodingResult) => {
    onLocationChange({
      lat: location.latitude,
      lon: location.longitude,
      name: location.name
    });
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleUseCurrentLocation = () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
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
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="flex items-center w-full">
        <div className="relative flex-grow">
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
        
        <Button 
          variant="outline"
          size="icon"
          className="ml-2 rounded-full aspect-square h-10"
          onClick={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          className="ml-2 rounded-full px-4 py-6"
          onClick={handleSearch}
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
      
      {showResults && results.length > 0 && (
        <div className="absolute mt-2 w-full z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
          <ScrollArea className="h-auto max-h-64">
            <div>
              {results.map((result, index) => (
                <button
                  key={`${result.name}-${index}`}
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
