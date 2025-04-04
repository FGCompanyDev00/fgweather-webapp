
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  message: string;
  retryAction?: () => void;
}

export function ErrorDisplay({ message, retryAction }: ErrorDisplayProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
      </CardContent>
      {retryAction && (
        <CardFooter>
          <Button variant="outline" onClick={retryAction}>
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
