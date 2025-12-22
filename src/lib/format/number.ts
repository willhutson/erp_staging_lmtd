export function formatNumber(num: number, style: "default" | "compact" | "percentage" = "default"): string {
  if (style === "percentage") {
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`
  }

  if (style === "compact") {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return new Intl.NumberFormat("en-US").format(num)
}
