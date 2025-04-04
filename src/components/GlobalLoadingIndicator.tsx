import { Loader2 } from "lucide-react";

interface GlobalLoadingIndicatorProps {
  message?: string;
}

export function GlobalLoadingIndicator({ message = "Loading..." }: GlobalLoadingIndicatorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
} 