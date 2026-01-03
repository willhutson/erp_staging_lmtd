"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Base skeleton with shimmer animation
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "circular" | "text";
}

export function Skeleton({ variant = "default", className, ...props }: SkeletonProps) {
  const variantClasses = {
    default: "h-4 w-full rounded",
    card: "h-32 w-full rounded-xl",
    circular: "h-10 w-10 rounded-full",
    text: "h-4 rounded",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

// Stat card skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Skeleton variant="circular" className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// Module card skeleton
export function ModuleCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <Skeleton className="h-1.5 w-full rounded-none" />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton variant="circular" className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Focus item skeleton
export function FocusItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" className="h-8 w-8" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

// Message skeleton
export function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <Skeleton variant="circular" className="h-9 w-9" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-4 border-b last:border-0", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-12 flex-shrink-0" : "flex-1",
            i === columns - 1 && "w-20 flex-shrink-0 flex-grow-0"
          )}
        />
      ))}
    </div>
  );
}

// AI greeting skeleton
export function AIGreetingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("ai-greeting", className)}>
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Dashboard grid skeleton
interface DashboardSkeletonProps {
  statCards?: number;
  focusItems?: number;
  className?: string;
}

export function DashboardSkeleton({
  statCards = 4,
  focusItems = 4,
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* AI Greeting */}
      <AIGreetingSkeleton />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: statCards }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: focusItems }).map((_, i) => (
              <FocusItemSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Studio grid skeleton
export function StudioGridSkeleton({ modules = 6, className }: { modules?: number; className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Hero */}
      <div className="rounded-2xl bg-muted p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-12 flex-1 max-w-2xl rounded-xl" />
          <Skeleton className="h-12 w-28 rounded-lg" />
        </div>
      </div>

      {/* Quick Create */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: modules }).map((_, i) => (
              <ModuleCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Chat skeleton
export function ChatSkeleton({ messages = 5, className }: { messages?: number; className?: string }) {
  return (
    <div className={cn("flex h-full", className)}>
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b px-4 flex items-center gap-3">
          <Skeleton variant="circular" className="h-6 w-6" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: messages }).map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Spinner component for inline loading
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={cn(
        "rounded-full border-primary border-t-transparent animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Loading overlay for sections
interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground mt-3">{message}</p>
    </div>
  );
}
