"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Studio Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          {error.message || "An unexpected error occurred in Studio."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = "/hub"} variant="outline">
            Go to Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
