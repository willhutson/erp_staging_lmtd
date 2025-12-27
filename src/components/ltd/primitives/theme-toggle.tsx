"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type ThemeMode = "light" | "dark"

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<ThemeMode>("light")

  useEffect(() => {
    setMounted(true)
    // Read theme from localStorage or document class
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || stored === "light") {
      setThemeState(stored)
    } else {
      setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"

    // Update DOM
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Persist to localStorage
    localStorage.setItem("theme", newTheme)

    // Update state
    setThemeState(newTheme)
  }

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-md",
          "hover:bg-ltd-surface-3 text-ltd-text-2 transition-colors",
          className
        )}
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-md",
        "hover:bg-ltd-surface-3 text-ltd-text-2 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ltd-ring-focus",
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  )
}
