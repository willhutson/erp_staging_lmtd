"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeSettings,
  defaultTheme,
  mergeTheme,
  generateCSSVariables,
} from "@/lib/theme";

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (theme: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<ThemeSettings> | null;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeSettings>(() =>
    mergeTheme(initialTheme ?? null)
  );

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const variables = generateCSSVariables(theme);

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Handle dark mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (theme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const setTheme = (newTheme: Partial<ThemeSettings>) => {
    setThemeState((prev) => mergeTheme({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
