"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { setTheme, getTheme, type ThemeMode } from "@/lib/design/modes"
import { LtdButton } from "./ltd-button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<ThemeMode>("light")

  useEffect(() => {
    setMounted(true)
    setThemeState(getTheme())
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    setThemeState(newTheme)
  }

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <LtdButton
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </LtdButton>
    )
  }

  return (
    <LtdButton
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </LtdButton>
  )
}
