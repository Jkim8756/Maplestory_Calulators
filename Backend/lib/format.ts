export function formatMeso(n: number): string {
  const value = Math.max(0, Number.isFinite(n) ? n : 0)
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

export function formatPct(n: number, decimals = 2): string {
  return `${((Number.isFinite(n) ? n : 0) * 100).toFixed(decimals)}%`
}

export function formatPercentValue(n: number, decimals = 2): string {
  return `${(Number.isFinite(n) ? n : 0).toFixed(decimals)}%`
}

export function formatDate(d: Date | null): string {
  if (!d) return 'Never'
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatNumber(n: number): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString()
}

export function formatExpLarge(n: number): string {
  const value = Math.max(0, Number.isFinite(n) ? n : 0)
  if (value >= 1_000_000_000_000_000) return `${(value / 1_000_000_000_000_000).toFixed(2)}Qa`
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return formatNumber(value)
}
