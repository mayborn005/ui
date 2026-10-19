import { describe, expect, it } from "vitest";

import { computeBudgetBreakdown, convertXlmToUsd, formatUtcDate } from "./budget";
import type { Transaction } from "./client";

const txs: Transaction[] = [
  {
    hash: "tx-1",
    ledger: 1,
    createdAt: "2026-01-01T00:00:00Z",
    successful: true,
    operationCount: 1,
    feePaid: "100",
    type: "Payment",
  },
  {
    hash: "tx-2",
    ledger: 2,
    createdAt: "2026-01-02T00:00:00Z",
    successful: true,
    operationCount: 1,
    feePaid: "75",
    type: "Payment",
  },
  {
    hash: "tx-3",
    ledger: 3,
    createdAt: "2026-01-03T00:00:00Z",
    successful: true,
    operationCount: 1,
    feePaid: "50",
    type: "Swap",
  },
];

describe("computeBudgetBreakdown", () => {
  it("returns an empty breakdown for an empty transaction list", () => {
    expect(computeBudgetBreakdown([])).toEqual({
      total: 0,
      categories: [],
    });
  });

  it("groups transaction amounts by type", () => {
    expect(computeBudgetBreakdown(txs)).toMatchObject({
      total: 225,
      categories: [
        { type: "Payment", amount: 175, count: 2 },
        { type: "Swap", amount: 50, count: 1 },
      ],
    });
  });

  it("adds amounts across all transactions for the total", () => {
    const breakdown = computeBudgetBreakdown(txs);
    expect(breakdown.total).toBe(225);
    expect(breakdown.categories.reduce((sum, item) => sum + item.amount, 0)).toBe(
      225,
    );
  });
});

describe("formatUtcDate", () => {
  it("formats the UTC calendar date, not the local one", () => {
    // Local-time formatting would print Dec 31, 2025 in timezones west of UTC.
    expect(formatUtcDate("2026-01-01T00:00:00Z")).toBe("Jan 1, 2026");
    expect(formatUtcDate("2026-03-15T23:59:59Z")).toBe("Mar 15, 2026");
  });

  it("returns a placeholder for invalid input", () => {
    expect(formatUtcDate("not-a-date")).toBe("—");
  });
});

describe("convertXlmToUsd", () => {
  it("multiplies by the rate and rounds to cents", () => {
    expect(convertXlmToUsd(1000, 0.12)).toBe(120);
    expect(convertXlmToUsd(12.345, 0.12)).toBe(1.48);
  });

  it("returns 0 for invalid or negative input", () => {
    expect(convertXlmToUsd(Number.NaN, 0.12)).toBe(0);
    expect(convertXlmToUsd(-5, 0.12)).toBe(0);
    expect(convertXlmToUsd(10, -1)).toBe(0);
  });
});
