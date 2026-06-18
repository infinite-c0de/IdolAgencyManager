export function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) {
    return `₩${(n / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(n) >= 1_000_000) {
    return `₩${(n / 1_000_000).toFixed(0)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `₩${(n / 1_000).toFixed(0)}K`;
  }
  return `₩${n}`;
}
