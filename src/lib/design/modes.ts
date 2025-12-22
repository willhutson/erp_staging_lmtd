"use client"

export type DensityMode = "compact" | "standard" | "comfortable"
export type SurfaceMode = "internal" | "client"
export type ThemeMode = "light" | "dark"

export function setDensity(mode: DensityMode) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.density = mode
  }
}

export function setSurface(mode: SurfaceMode) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.surface = mode
  }
}

export function setDir(dir: "ltr" | "rtl") {
  if (typeof document !== "undefined") {
    document.documentElement.dir = dir
  }
}

export function setTheme(mode: ThemeMode) {
  if (typeof document !== "undefined") {
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", mode)
  }
}

export function getDensity(): DensityMode {
  if (typeof document !== "undefined") {
    return (document.documentElement.dataset.density as DensityMode) || "standard"
  }
  return "standard"
}

export function getSurface(): SurfaceMode {
  if (typeof document !== "undefined") {
    return (document.documentElement.dataset.surface as SurfaceMode) || "internal"
  }
  return "internal"
}

export function getDir(): "ltr" | "rtl" {
  if (typeof document !== "undefined") {
    return (document.documentElement.dir as "ltr" | "rtl") || "ltr"
  }
  return "ltr"
}

export function getTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || stored === "light") {
      return stored
    }
    return document.documentElement.classList.contains("dark") ? "dark" : "light"
  }
  return "light"
}

export function initTheme() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }
}
