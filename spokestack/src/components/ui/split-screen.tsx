"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitScreenProps {
  children: React.ReactNode;
  className?: string;
  ratio?: "equal" | "input-heavy" | "output-heavy";
  direction?: "horizontal" | "vertical";
  collapsible?: boolean;
}

export function SplitScreen({
  children,
  className,
  ratio = "equal",
  direction = "horizontal",
  collapsible = true,
}: SplitScreenProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const ratioClasses = {
    equal: "grid-cols-1 lg:grid-cols-2",
    "input-heavy": "grid-cols-1 lg:grid-cols-[1.5fr_1fr]",
    "output-heavy": "grid-cols-1 lg:grid-cols-[1fr_1.5fr]",
  };

  const verticalClasses = {
    equal: "grid-rows-2",
    "input-heavy": "grid-rows-[1.5fr_1fr]",
    "output-heavy": "grid-rows-[1fr_1.5fr]",
  };

  return (
    <div
      className={cn(
        "grid gap-4 min-h-[600px]",
        direction === "horizontal" ? ratioClasses[ratio] : verticalClasses[ratio],
        isCollapsed && "lg:grid-cols-1",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SplitScreenPanelProps {
  children: React.ReactNode;
  className?: string;
  type?: "input" | "output";
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SplitScreenInput({
  children,
  className,
  title,
  icon,
  actions,
}: SplitScreenPanelProps) {
  return (
    <div
      className={cn(
        "split-screen-input flex flex-col h-full",
        "bg-muted/30 rounded-xl p-6",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            {title && <h3 className="font-semibold">{title}</h3>}
          </div>
          {actions}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

export function SplitScreenOutput({
  children,
  className,
  title,
  icon,
  actions,
}: SplitScreenPanelProps) {
  return (
    <div
      className={cn(
        "split-screen-output flex flex-col h-full",
        "bg-card rounded-xl border p-6",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            {title && <h3 className="font-semibold">{title}</h3>}
          </div>
          {actions}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

// AI-specific split screen with input/output pattern
interface AISplitScreenProps {
  inputTitle?: string;
  outputTitle?: string;
  inputContent: React.ReactNode;
  outputContent: React.ReactNode;
  inputActions?: React.ReactNode;
  outputActions?: React.ReactNode;
  isProcessing?: boolean;
  className?: string;
}

export function AISplitScreen({
  inputTitle = "Input",
  outputTitle = "Output",
  inputContent,
  outputContent,
  inputActions,
  outputActions,
  isProcessing = false,
  className,
}: AISplitScreenProps) {
  return (
    <SplitScreen className={className}>
      <SplitScreenInput title={inputTitle} actions={inputActions}>
        {inputContent}
      </SplitScreenInput>
      <SplitScreenOutput title={outputTitle} actions={outputActions}>
        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Processing...</p>
            </div>
          </div>
        ) : (
          outputContent
        )}
      </SplitScreenOutput>
    </SplitScreen>
  );
}

// Canvas-style split screen for creative tools
interface CanvasSplitScreenProps {
  toolbar: React.ReactNode;
  canvas: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarPosition?: "left" | "right";
  className?: string;
}

export function CanvasSplitScreen({
  toolbar,
  canvas,
  sidebar,
  sidebarPosition = "right",
  className,
}: CanvasSplitScreenProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="border-b bg-card px-4 py-2">{toolbar}</div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {sidebar && sidebarPosition === "left" && (
          <div className="w-64 border-r bg-muted/30 p-4 overflow-auto">
            {sidebar}
          </div>
        )}

        <div className="flex-1 overflow-auto bg-muted/10">{canvas}</div>

        {sidebar && sidebarPosition === "right" && (
          <div className="w-64 border-l bg-muted/30 p-4 overflow-auto">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}
