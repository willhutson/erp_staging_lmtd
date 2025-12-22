export function formatMoney(amount: number, currency: "AED" | "USD" = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMoneyCompact(amount: number, currency: "AED" | "USD" = "USD"): string {
  if (amount >= 1000000) {
    return `${currency === "AED" ? "AED" : "$"}${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${currency === "AED" ? "AED" : "$"}${(amount / 1000).toFixed(1)}K`
  }
  return formatMoney(amount, currency)
}
