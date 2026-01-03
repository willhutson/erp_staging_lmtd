"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Brain } from "lucide-react";

interface RandomnessDialProps {
  value: number; // 0-10
  onChange: (value: number) => void;
  label?: string;
  showLabels?: boolean;
  className?: string;
}

export function RandomnessDial({
  value,
  onChange,
  label = "Creativity",
  showLabels = true,
  className,
}: RandomnessDialProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValue(e as unknown as React.MouseEvent);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newValue = Math.round(percentage * 10);
    onChange(Math.max(0, Math.min(10, newValue)));
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const getIcon = () => {
    if (value <= 3) return <Brain className="w-4 h-4" />;
    if (value <= 7) return <Sparkles className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getDescription = () => {
    if (value <= 2) return "Conservative";
    if (value <= 4) return "Balanced";
    if (value <= 6) return "Creative";
    if (value <= 8) return "Experimental";
    return "Wild";
  };

  return (
    <div className={cn("randomness-dial", className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm text-muted-foreground">{value}/10</span>
          </div>
          <span className="text-xs text-muted-foreground">{getDescription()}</span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-3 rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right,
            hsl(200, 80%, 50%) 0%,
            hsl(160, 84%, 63%) 50%,
            hsl(30, 90%, 55%) 100%
          )`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
            "w-5 h-5 rounded-full bg-white shadow-lg border-2 border-primary",
            "transition-transform",
            isDragging ? "scale-110 cursor-grabbing" : "cursor-grab hover:scale-105"
          )}
          style={{ left: `${value * 10}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Focused</span>
          <span>Creative</span>
          <span>Wild</span>
        </div>
      )}
    </div>
  );
}

// Slider variant for more precise control
interface CreativitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function CreativitySlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label = "Creativity Temperature",
  className,
}: CreativitySliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-muted-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "w-full h-2 rounded-full appearance-none cursor-pointer",
          "bg-gradient-to-r from-blue-500 via-primary to-orange-500",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
          "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2",
          "[&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-grab",
          "[&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-110"
        )}
        style={
          {
            "--value-percent": `${percentage}%`,
          } as React.CSSProperties
        }
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Precise</span>
        <span>Balanced</span>
        <span>Creative</span>
      </div>
    </div>
  );
}
