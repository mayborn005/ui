import type { Transaction } from "./client";

export interface BudgetCategory {
  type: string;
  amount: number;
  count: number;
}

export interface BudgetBreakdown {
  total: number;
  categories: BudgetCategory[];
}

export function computeBudgetBreakdown(
  transactions: Transaction[],
): BudgetBreakdown {
  const totals = new Map<string, { amount: number; count: number }>();

  for (const tx of transactions) {
    const type = tx.type ?? tx.operationType ?? "Unknown";
    const amount = Number.parseFloat(tx.feePaid ?? "0") || 0;

    const current = totals.get(type) ?? { amount: 0, count: 0 };
    current.amount += amount;
    current.count += 1;
    totals.set(type, current);
  }

  return {
    total: [...totals.values()].reduce((sum, item) => sum + item.amount, 0),
    categories: [...totals.entries()]
      .map(([type, values]) => ({
        type,
        amount: values.amount,
        count: values.count,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}

/**
 * Format an ISO timestamp as a calendar date in UTC ("Jan 1, 2026"). Always
 * UTC so the output never shifts a day for users west of Greenwich.
 */
export function formatUtcDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Convert an XLM amount to USD at `rate` (USD per 1 XLM), rounded to cents. */
export function convertXlmToUsd(xlm: number, rate: number): number {
  if (!Number.isFinite(xlm) || !Number.isFinite(rate) || xlm < 0 || rate < 0) return 0;
  return Math.round(xlm * rate * 100) / 100;
}
