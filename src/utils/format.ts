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

type RevenuePoint = { m: string; group: number; solo: number; merch: number };

/**
 * Collapses weekly revenue history into one averaged point per calendar month.
 * Keeps the order of first appearance so the chart x-axis stays chronological.
 */
export function aggregateMonthlyRevenue(weekly: RevenuePoint[]): RevenuePoint[] {
  // Strip legacy labels (old "W{n}" weekly format or old "'YY" suffix format)
  const valid = weekly.filter(pt => !/^W\d+$/.test(pt.m) && !pt.m.includes("'"));

  const order: string[] = [];
  const acc: Record<string, { group: number; solo: number; merch: number; count: number }> = {};
  for (const pt of valid) {
    if (!acc[pt.m]) {
      order.push(pt.m);
      acc[pt.m] = { group: 0, solo: 0, merch: 0, count: 0 };
    }
    acc[pt.m].group += pt.group;
    acc[pt.m].solo  += pt.solo;
    acc[pt.m].merch += pt.merch;
    acc[pt.m].count += 1;
  }
  return order.map(m => ({
    m,
    group: Math.round(acc[m].group / acc[m].count),
    solo:  Math.round(acc[m].solo  / acc[m].count),
    merch: Math.round(acc[m].merch / acc[m].count),
  })).filter(pt => pt.group + pt.solo + pt.merch > 0);
}
