"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./card";
import { Badge } from "./badge";
import { ArrowRight, Sparkles, AlertCircle, CheckCircle2, Clock } from "lucide-react";

// Interactive Card with lift animation and optional glow
interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "gradient" | "outlined";
  interactive?: boolean;
  glowOnHover?: boolean;
  accentColor?: string;
}

export function InteractiveCard({
  children,
  variant = "default",
  interactive = true,
  glowOnHover = false,
  accentColor,
  className,
  ...props
}: InteractiveCardProps) {
  const variantClasses = {
    default: "bg-card",
    glass: "glass",
    gradient: "gradient-brand-subtle",
    outlined: "bg-transparent border-2",
  };

  return (
    <Card
      className={cn(
        variantClasses[variant],
        interactive && "interactive-lift cursor-pointer",
        glowOnHover && "interactive-glow",
        className
      )}
      style={accentColor ? { borderTopColor: accentColor } : undefined}
      {...props}
    >
      {children}
    </Card>
  );
}

// Stat Card for dashboard metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  subtitle?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  change,
  subtitle,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("interactive-lift", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">{value}</span>
          {change && (
            <span
              className={cn(
                "text-sm font-medium",
                change.type === "increase" && "text-emerald-500",
                change.type === "decrease" && "text-red-500",
                change.type === "neutral" && "text-muted-foreground"
              )}
            >
              {change.type === "increase" ? "↑" : change.type === "decrease" ? "↓" : ""}
              {Math.abs(change.value)}%
            </span>
          )}
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Module Card for navigation grids
interface ModuleCardProps {
  title: string;
  description: string;
  href?: string;
  icon: React.ReactNode;
  color: string; // Tailwind gradient class
  stats?: { count: number; label: string };
  badges?: Array<{ label: string; variant?: "default" | "ai" | "featured" }>;
  className?: string;
  onClick?: () => void;
}

export function ModuleCard({
  title,
  description,
  href,
  icon,
  color,
  stats,
  badges = [],
  className,
  onClick,
}: ModuleCardProps) {
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={cn("group block", className)}
    >
      <Card className="h-full interactive-lift overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${color}`} />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {badges.map((badge, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      badge.variant === "ai" && "gap-1",
                      badge.variant === "featured" && "bg-primary/10 text-primary border-0"
                    )}
                  >
                    {badge.variant === "ai" && <Sparkles className="h-2.5 w-2.5" />}
                    {badge.label}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
              {stats && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium">
                    {stats.count} {stats.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
}

// Focus Item Card for urgent tasks
interface FocusItemCardProps {
  title: string;
  type: "overdue" | "due_today" | "upcoming" | "needs_attention";
  dueDate: string;
  client?: string;
  briefType?: string;
  onClick?: () => void;
  className?: string;
}

export function FocusItemCard({
  title,
  type,
  dueDate,
  client,
  briefType,
  onClick,
  className,
}: FocusItemCardProps) {
  const typeConfig = {
    overdue: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      label: "Overdue",
      Icon: AlertCircle,
    },
    due_today: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      label: "Due Today",
      Icon: Clock,
    },
    upcoming: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      label: "Upcoming",
      Icon: Clock,
    },
    needs_attention: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      label: "Needs Attention",
      Icon: AlertCircle,
    },
  };

  const config = typeConfig[type];
  const Icon = config.Icon;

  return (
    <Card
      className={cn("interactive-lift cursor-pointer", className)}
      onClick={onClick}
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-4 w-4 ${config.text}`} />
            </div>
            <div>
              <p className="font-medium">{title}</p>
              {(client || briefType) && (
                <div className="flex items-center gap-2 mt-1">
                  {client && (
                    <span className="text-sm text-muted-foreground">{client}</span>
                  )}
                  {client && briefType && (
                    <span className="text-muted-foreground">•</span>
                  )}
                  {briefType && (
                    <span className="text-sm text-muted-foreground">{briefType}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
              {config.label}
            </span>
            <p className="text-xs text-muted-foreground mt-1">{dueDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Notification Card
interface NotificationCardProps {
  message: string;
  time: string;
  type: "complete" | "warning" | "info" | "assignment";
  className?: string;
}

export function NotificationCard({
  message,
  time,
  type,
  className,
}: NotificationCardProps) {
  const typeConfig = {
    complete: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      Icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      Icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      Icon: Sparkles,
      color: "text-blue-600 dark:text-blue-400",
    },
    assignment: {
      bg: "bg-primary/10",
      Icon: ArrowRight,
      color: "text-primary",
    },
  };

  const config = typeConfig[type];
  const Icon = config.Icon;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className={`p-1.5 rounded-full ${config.bg}`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

// Empty State Card
interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateCardProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            {icon}
          </div>
          <h3 className="font-medium mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
          )}
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

// AI Insight Card
interface AIInsightCardProps {
  title: string;
  insight: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function AIInsightCard({
  title,
  insight,
  icon,
  action,
  className,
}: AIInsightCardProps) {
  return (
    <Card className={cn("bg-primary/5 border-primary/20", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon || <Sparkles className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{insight}</p>
            {action && <div className="mt-3">{action}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
