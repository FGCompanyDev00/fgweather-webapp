import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  AlertCircle,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Share2
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationSearch } from "@/components/LocationSearch";
import { fetchWeatherNews, fetchAlternativeWeatherNews, NewsArticle } from "@/lib/utils/news-api/weather-news";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/App";
import { useLocation, locationDataToComponentFormat } from "@/contexts/LocationContext";
import { LocationData } from "@/lib/utils/location-utils";

export default function WeatherNews() {
  const { location, isLoading: isLocationLoading, updateLocation } = useLocation();
  
  // Convert LocationData to the format expected by this component
  const formattedLocation = location ? locationDataToComponentFormat(location) : {
    lat: 3.1390, 
    lon: 101.6869, 
    name: "Kuala Lumpur",
    isCurrentLocation: false
  };
  
  const { setIsLoading, setLoadingMessage } = useLoading();
  const [activeTab, setActiveTab] = useState<"local" | "global">("local");
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  
  // Load bookmarked articles from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('fg-weather-bookmarked-news');
    if (savedBookmarks) {
      try {
        setBookmarkedArticles(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error("Failed to parse bookmarked articles:", error);
      }
    }
  }, []);
  
  // Save bookmarked articles to localStorage
  useEffect(() => {
    localStorage.setItem('fg-weather-bookmarked-news', JSON.stringify(bookmarkedArticles));
  }, [bookmarkedArticles]);
  
  // Fetch local news (based on user location)
  const { 
    data: localNews, 
    isLoading: isLocalNewsLoading, 
    error: localNewsError,
    refetch: refetchLocalNews 
  } = useQuery({
    queryKey: ['weatherNews', 'local', formattedLocation.name],
    queryFn: () => fetchWeatherNews(formattedLocation.name.split(',')[0]), // Use only the city name
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: !!formattedLocation.name
  });
  
  // Fetch global news
  const { 
    data: globalNews, 
    isLoading: isGlobalNewsLoading, 
    error: globalNewsError,
    refetch: refetchGlobalNews 
  } = useQuery({
    queryKey: ['weatherNews', 'global'],
    queryFn: () => activeTab === "global" ? fetchWeatherNews() : Promise.resolve([]),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: activeTab === "global"
  });
  
  // Fetch alternative news (fallback) if regular news fails
  const { 
    data: fallbackNews, 
    isLoading: isFallbackNewsLoading 
  } = useQuery({
    queryKey: ['weatherNews', 'fallback', formattedLocation.name],
    queryFn: () => fetchAlternativeWeatherNews(formattedLocation.name.split(',')[0]),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    // Enable fallback news when local or global news is empty
    enabled: activeTab === "local" 
      ? (!localNews || localNews.length === 0) 
      : (!globalNews || globalNews.length === 0)
  });
  
  // Determine which news to display (with better fallback handling)
  const displayLocalNews = localNews && localNews.length > 0 
    ? localNews 
    : fallbackNews || [];
    
  const displayGlobalNews = globalNews && globalNews.length > 0 
    ? globalNews 
    : fallbackNews || [];
  
  // Set global loading state based on news loading
  useEffect(() => {
    const isLoading = 
      isLocalNewsLoading || 
      isGlobalNewsLoading || 
      isFallbackNewsLoading;
      
    if (isLoading) {
      setIsLoading(true);
      setLoadingMessage("Fetching weather news...");
    } else {
      setIsLoading(false);
    }
  }, [
    isLocalNewsLoading, 
    isGlobalNewsLoading, 
    isFallbackNewsLoading, 
    setIsLoading, 
    setLoadingMessage
  ]);
  
  // Handle location change from search
  const handleLocationChange = (newLocation: { lat: number; lon: number; name: string }) => {
    // Convert to LocationData format
    const locationData: LocationData = {
      latitude: newLocation.lat,
      longitude: newLocation.lon,
      name: newLocation.name,
      isCurrentLocation: false
    };
    
    // Update location in the context
    updateLocation(locationData);
  };
  
  // Toggle bookmark for an article
  const toggleBookmark = (articleTitle: string) => {
    setBookmarkedArticles(prev => {
      if (prev.includes(articleTitle)) {
        toast.info("Article removed from bookmarks");
        return prev.filter(title => title !== articleTitle);
      } else {
        toast.success("Article bookmarked!");
        return [...prev, articleTitle];
      }
    });
  };
  
  // Share an article
  const shareArticle = async (article: NewsArticle) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url
        });
        toast.success("Article shared successfully");
      } catch (error) {
        console.error("Error sharing article:", error);
        toast.error("Failed to share article");
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${article.title} - ${article.url}`);
        toast.success("Article link copied to clipboard");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy article link");
      }
    }
  };
  
  // Refresh news data
  const refreshNews = () => {
    if (activeTab === "local") {
      refetchLocalNews();
    } else {
      refetchGlobalNews();
    }
    toast.info("Refreshing weather news...");
  };
  
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  // Show loading screen if all data is loading
  if (isLocationLoading && isLocalNewsLoading && isGlobalNewsLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Helmet>
        <title>Weather News | {formattedLocation.name} | FGWeather</title>
        <meta name="description" content="Latest weather news and updates from around the world" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-100 dark:from-slate-900 dark:to-blue-950 transition-all duration-500">
        <div className="container mx-auto px-4 py-6 min-h-screen">
          <header className="flex flex-col space-y-6 mb-8">
            <div className="flex justify-between items-center">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400"
                animate={{ 
                  textShadow: [
                    "0 0 5px rgba(147,51,234,0.3)",
                    "0 0 15px rgba(147,51,234,0.3)",
                    "0 0 5px rgba(147,51,234,0.3)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                FGWeather
              </motion.h1>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={refreshNews}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
            
            <Navigation />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <LocationSearch 
                onLocationChange={handleLocationChange}
              />
              
              {formattedLocation.isCurrentLocation && (
                <Badge variant="outline" className="flex gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  <MapPin className="h-3.5 w-3.5" />
                  Current Location
                </Badge>
              )}
            </div>
          </header>
          
          <motion.main
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Newspaper className="h-5 w-5" />
                    <span>Weather News (Available Soon!)</span>
                  </CardTitle>
                  <CardDescription>
                    Latest weather updates and forecasts
                  </CardDescription>
                </div>
                
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "local" | "global")}>
                  <TabsList className="grid grid-cols-2 w-[200px]">
                    <TabsTrigger value="local">Local News</TabsTrigger>
                    <TabsTrigger value="global">Global</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === "local" ? (
                      isLocalNewsLoading ? (
                        <NewsSkeletonList />
                      ) : displayLocalNews.length > 0 ? (
                        <NewsArticleList 
                          articles={displayLocalNews} 
                          bookmarkedArticles={bookmarkedArticles}
                          onToggleBookmark={toggleBookmark}
                          onShareArticle={shareArticle}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No weather news found</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            We couldn't find any weather news for this location. Try checking global news or refresh.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => refetchLocalNews()}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                          </Button>
                        </div>
                      )
                    ) : (
                      isGlobalNewsLoading ? (
                        <NewsSkeletonList />
                      ) : displayGlobalNews.length > 0 ? (
                        <NewsArticleList 
                          articles={displayGlobalNews} 
                          bookmarkedArticles={bookmarkedArticles}
                          onToggleBookmark={toggleBookmark}
                          onShareArticle={shareArticle}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No global weather news found</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            We couldn't find any global weather news. Please try again later.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => refetchGlobalNews()}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                          </Button>
                        </div>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Last updated: {new Date().toLocaleString()}
              </CardFooter>
            </Card>
            
            {/* Bookmarked Articles */}
            {bookmarkedArticles.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/10 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookmarkCheck className="h-5 w-5 text-purple-500" />
                      <span>Bookmarked Articles</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...displayLocalNews, ...displayGlobalNews]
                        .filter(article => bookmarkedArticles.includes(article.title))
                        .map((article, index) => (
                          <motion.a
                            key={`bookmark-${index}`}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <h3 className="font-medium flex items-center">
                              {article.title}
                              <ExternalLink className="h-3.5 w-3.5 ml-2 text-purple-500" />
                            </h3>
                          </motion.a>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.main>
          
          <footer className="mt-8 pt-4 text-sm text-center text-slate-500 dark:text-slate-400">
            <p>Developed by Faiz Nasir</p>
          </footer>
        </div>
      </div>
    </>
  );
}

// Skeleton loading for news articles
function NewsSkeletonList() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-48 sm:h-32 sm:w-48 rounded-lg flex-shrink-0" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// News article list component
function NewsArticleList({ 
  articles, 
  bookmarkedArticles, 
  onToggleBookmark, 
  onShareArticle 
}: { 
  articles: NewsArticle[]; 
  bookmarkedArticles: string[];
  onToggleBookmark: (title: string) => void;
  onShareArticle: (article: NewsArticle) => void;
}) {
  // Define animation variants within the component
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const listItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {articles.map((article, index) => (
        <motion.div 
          key={`news-${index}`}
          className="flex flex-col sm:flex-row gap-4 bg-white/30 dark:bg-slate-700/30 p-4 rounded-lg border border-white/20 dark:border-slate-600/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
          variants={listItemVariants}
        >
          <div 
            className="h-48 sm:h-32 sm:w-48 rounded-lg bg-cover bg-center flex-shrink-0 relative overflow-hidden"
            style={{ backgroundImage: `url(${article.image || '/assets/weather-default.jpg'})` }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            <div className="absolute bottom-2 left-2 right-2">
              <Badge 
                variant="outline" 
                className="bg-white/80 text-slate-800 text-xs px-2 py-1 max-w-full truncate"
              >
                {article.source.name}
              </Badge>
            </div>
            <img 
              src={article.image || '/assets/weather-default.jpg'}
              alt=""
              className="hidden"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const div = target.parentElement as HTMLDivElement;
                if (div) {
                  div.style.backgroundImage = `url('/assets/weather-default.jpg')`;
                }
              }}
            />
          </div>
          
          <div className="flex-grow space-y-2">
            <a 
              href={article.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block group"
            >
              <h3 className="text-lg font-medium line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-start">
                {article.title}
                <ArrowUpRight className="h-4 w-4 ml-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
            </a>
            
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-xs text-slate-500">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onToggleBookmark(article.title)}
                >
                  {bookmarkedArticles.includes(article.title) ? (
                    <BookmarkCheck className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onShareArticle(article)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  asChild
                >
                  <a 
                    href={article.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    Read More
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
} 