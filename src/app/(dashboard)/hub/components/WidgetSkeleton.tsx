import { cn } from "@/lib/utils";

interface WidgetSkeletonProps {
  title?: string;
  height?: string;
}

export function WidgetSkeleton({ title, height = "h-32" }: WidgetSkeletonProps) {
  return (
    <div className="animate-pulse">
      {title && (
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
      )}
      <div className={cn("bg-gray-100 rounded-lg", height)} />
    </div>
  );
}
