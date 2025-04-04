
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingScreen() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-center items-center">
        <Skeleton className="w-full max-w-md h-12 rounded-full" />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 animate-pulse">
            <div className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex space-x-4 overflow-x-auto">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-10 rounded-full mb-2" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex flex-col space-y-3">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
