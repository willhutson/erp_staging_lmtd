"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type WorkspaceMode = "living" | "control" | "executive";

interface WorkspaceModeContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

const WorkspaceModeContext = createContext<WorkspaceModeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "spokestack-workspace-mode";

interface WorkspaceModeProviderProps {
  children: React.ReactNode;
  defaultMode?: WorkspaceMode;
}

export function WorkspaceModeProvider({
  children,
  defaultMode = "living",
}: WorkspaceModeProviderProps) {
  const [mode, setModeState] = useState<WorkspaceMode>(defaultMode);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY) as WorkspaceMode | null;
    if (stored && ["living", "control", "executive"].includes(stored)) {
      setModeState(stored);
      document.documentElement.setAttribute("data-workspace", stored);
    } else {
      document.documentElement.setAttribute("data-workspace", defaultMode);
    }
  }, [defaultMode]);

  const setMode = (newMode: WorkspaceMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    document.documentElement.setAttribute("data-workspace", newMode);
  };

  return (
    <WorkspaceModeContext.Provider value={{ mode, setMode }}>
      {children}
    </WorkspaceModeContext.Provider>
  );
}

export function useWorkspaceMode() {
  const context = useContext(WorkspaceModeContext);
  if (context === undefined) {
    throw new Error(
      "useWorkspaceMode must be used within a WorkspaceModeProvider"
    );
  }
  return context;
}

// Mode selector component
interface WorkspaceModeSelectorProps {
  className?: string;
}

export function WorkspaceModeSelector({ className }: WorkspaceModeSelectorProps) {
  const { mode, setMode } = useWorkspaceMode();

  const modes: { value: WorkspaceMode; label: string; description: string }[] = [
    {
      value: "living",
      label: "Living",
      description: "Light, airy, activity-focused",
    },
    {
      value: "control",
      label: "Control",
      description: "Dark, data-dense, terminal-like",
    },
    {
      value: "executive",
      label: "Executive",
      description: "Clean, KPI-forward, minimal",
    },
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${
              mode === m.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }
          `}
          title={m.description}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
