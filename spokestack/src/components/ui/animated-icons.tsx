"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Bell,
  Send,
  RefreshCw,
  Loader2,
  Heart,
  Star,
  TrendingUp,
  ArrowRight,
  Plus,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";

// Animation wrapper that adds effects to any icon
interface AnimatedIconProps {
  icon: LucideIcon;
  animation?: "pulse" | "spin" | "bounce" | "wiggle" | "ping" | "float" | "shake";
  trigger?: "hover" | "always" | "click";
  className?: string;
  size?: number;
}

export function AnimatedIcon({
  icon: Icon,
  animation = "pulse",
  trigger = "always",
  className,
  size = 24,
}: AnimatedIconProps) {
  const [isAnimating, setIsAnimating] = React.useState(trigger === "always");

  const animationClasses = {
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
    wiggle: "animate-wiggle",
    ping: "animate-ping",
    float: "animate-float",
    shake: "animate-shake",
  };

  const handleMouseEnter = () => {
    if (trigger === "hover") setIsAnimating(true);
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") setIsAnimating(false);
  };

  const handleClick = () => {
    if (trigger === "click") {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <Icon
      className={cn(
        "transition-all",
        isAnimating && animationClasses[animation],
        className
      )}
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
}

// Pre-configured animated icons for common use cases

// Sparkles that twinkle
export function SparklesAnimated({
  className,
  size = 24,
  trigger = "always",
}: {
  className?: string;
  size?: number;
  trigger?: "hover" | "always";
}) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <Sparkles
        className={cn(
          "absolute inset-0 transition-all",
          trigger === "always" ? "animate-sparkle" : "group-hover:animate-sparkle"
        )}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

// Zap with electric pulse
export function ZapAnimated({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <Zap
        className="absolute inset-0 animate-zap"
        style={{ width: size, height: size }}
      />
      <div className="absolute inset-0 animate-zap-glow opacity-50 blur-sm">
        <Zap style={{ width: size, height: size }} />
      </div>
    </div>
  );
}

// Check with pop-in effect
export function CheckAnimated({
  className,
  size = 24,
  show = true,
}: {
  className?: string;
  size?: number;
  show?: boolean;
}) {
  return (
    <CheckCircle2
      className={cn(
        "transition-all duration-300",
        show ? "scale-100 opacity-100" : "scale-0 opacity-0",
        "animate-check-pop",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

// Bell with ring animation
export function BellAnimated({
  className,
  size = 24,
  hasNotification = false,
}: {
  className?: string;
  size?: number;
  hasNotification?: boolean;
}) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <Bell
        className={cn(
          "transition-all",
          hasNotification && "animate-bell-ring"
        )}
        style={{ width: size, height: size }}
      />
      {hasNotification && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
}

// Send with fly-away effect
export function SendAnimated({
  className,
  size = 24,
  onSend,
}: {
  className?: string;
  size?: number;
  onSend?: () => void;
}) {
  const [isSending, setIsSending] = React.useState(false);

  const handleClick = () => {
    setIsSending(true);
    onSend?.();
    setTimeout(() => setIsSending(false), 500);
  };

  return (
    <Send
      className={cn(
        "cursor-pointer transition-all",
        isSending && "animate-send-fly",
        className
      )}
      style={{ width: size, height: size }}
      onClick={handleClick}
    />
  );
}

// Loading spinner with better animation
export function LoadingAnimated({
  className,
  size = 24,
  text,
}: {
  className?: string;
  size?: number;
  text?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RefreshCw
        className="animate-spin"
        style={{ width: size, height: size }}
      />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Heart with beat animation
export function HeartAnimated({
  className,
  size = 24,
  isLiked = false,
}: {
  className?: string;
  size?: number;
  isLiked?: boolean;
}) {
  return (
    <Heart
      className={cn(
        "cursor-pointer transition-all",
        isLiked ? "fill-red-500 text-red-500 animate-heart-beat" : "hover:scale-110",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

// Star with twinkle
export function StarAnimated({
  className,
  size = 24,
  filled = false,
}: {
  className?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <Star
      className={cn(
        "cursor-pointer transition-all",
        filled ? "fill-amber-400 text-amber-400 animate-star-twinkle" : "hover:text-amber-400",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

// Trending up with grow effect
export function TrendingAnimated({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <TrendingUp
      className={cn("animate-trend-grow text-emerald-500", className)}
      style={{ width: size, height: size }}
    />
  );
}

// Plus that rotates into X
export function PlusToX({
  className,
  size = 24,
  isOpen = false,
}: {
  className?: string;
  size?: number;
  isOpen?: boolean;
}) {
  return isOpen ? (
    <X
      className={cn("transition-transform duration-200 rotate-0", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <Plus
      className={cn("transition-transform duration-200", className)}
      style={{ width: size, height: size }}
    />
  );
}

// Arrow that slides on hover
export function ArrowSlide({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <ArrowRight
      className={cn(
        "transition-transform duration-200 group-hover:translate-x-1",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

// Success animation (checkmark with circle draw)
export function SuccessAnimated({
  className,
  size = 48,
  show = true,
}: {
  className?: string;
  size?: number;
  show?: boolean;
}) {
  if (!show) return null;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 52 52"
        className="w-full h-full"
      >
        <circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-emerald-500 animate-circle-draw"
          style={{
            strokeDasharray: 166,
            strokeDashoffset: 166,
          }}
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
          className="text-emerald-500 animate-check-draw"
          style={{
            strokeDasharray: 48,
            strokeDashoffset: 48,
          }}
        />
      </svg>
    </div>
  );
}

// AI thinking animation (three dots)
export function AIThinking({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span
        className="w-2 h-2 rounded-full bg-primary animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-primary animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-primary animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}
