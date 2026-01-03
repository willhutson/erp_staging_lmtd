"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AIGreetingProps {
  userName?: string;
  greeting?: string;
  message: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export function AIGreeting({
  userName,
  greeting,
  message,
  suggestions,
  onSuggestionClick,
  className,
}: AIGreetingProps) {
  // Generate time-based greeting if not provided
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayGreeting = greeting || getTimeGreeting();
  const displayName = userName ? `, ${userName}` : "";

  return (
    <div className={cn("ai-greeting animate-fade-in-up", className)}>
      <div className="ai-avatar">
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="ai-message">
        <p className="ai-message-header">
          {displayGreeting}{displayName}
        </p>
        <p className="ai-message-content">{message}</p>
        {suggestions && suggestions.length > 0 && (
          <div className="ai-suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="ai-suggestion-chip"
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Focus summary component for Hub
interface FocusItem {
  id: string;
  title: string;
  type: "overdue" | "due_today" | "upcoming" | "needs_attention";
  meta?: string;
  href?: string;
}

interface AIFocusSummaryProps {
  userName?: string;
  items: FocusItem[];
  className?: string;
}

export function AIFocusSummary({
  userName,
  items,
  className,
}: AIFocusSummaryProps) {
  const overdueCount = items.filter((i) => i.type === "overdue").length;
  const dueTodayCount = items.filter((i) => i.type === "due_today").length;
  const needsAttentionCount = items.filter((i) => i.type === "needs_attention").length;

  const generateMessage = () => {
    const parts: string[] = [];

    if (overdueCount > 0) {
      parts.push(`${overdueCount} overdue item${overdueCount > 1 ? "s" : ""}`);
    }
    if (dueTodayCount > 0) {
      parts.push(`${dueTodayCount} due today`);
    }
    if (needsAttentionCount > 0) {
      parts.push(`${needsAttentionCount} need${needsAttentionCount === 1 ? "s" : ""} attention`);
    }

    if (parts.length === 0) {
      return "You're all caught up! No urgent items.";
    }

    return `You have ${parts.join(", ")}.`;
  };

  const getSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (overdueCount > 0) {
      suggestions.push("Show overdue");
    }
    if (dueTodayCount > 0) {
      suggestions.push("Today's deadlines");
    }
    if (items.length > 5) {
      suggestions.push("View all");
    }

    return suggestions.slice(0, 3);
  };

  return (
    <AIGreeting
      userName={userName}
      message={generateMessage()}
      suggestions={getSuggestions()}
      className={className}
    />
  );
}

// Quick stats row component
interface QuickStat {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
}

interface AIQuickStatsProps {
  stats: QuickStat[];
  className?: string;
}

export function AIQuickStats({ stats, className }: AIQuickStatsProps) {
  return (
    <div className={cn(
      "grid gap-4",
      stats.length === 2 ? "grid-cols-2" :
      stats.length === 3 ? "grid-cols-3" :
      stats.length >= 4 ? "grid-cols-2 md:grid-cols-4" :
      "grid-cols-1",
      className
    )}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "p-4 rounded-lg border bg-card",
            "animate-fade-in-up",
            `animation-delay-${(index + 1) * 100}`
          )}
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            {stat.icon}
            <span className="text-sm">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{stat.value}</span>
            {stat.change && (
              <span className={cn(
                "text-sm font-medium",
                stat.change.type === "increase" ? "text-emerald-500" :
                stat.change.type === "decrease" ? "text-red-500" :
                "text-muted-foreground"
              )}>
                {stat.change.type === "increase" ? "↑" : stat.change.type === "decrease" ? "↓" : ""}
                {Math.abs(stat.change.value)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
