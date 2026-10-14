import { describe, expect, it } from "vitest";
import { LOW_STOCK_THRESHOLD, getStockStatus, stockLabel } from "./stock";

describe("getStockStatus", () => {
  it("uses a low-stock threshold of 5", () => {
    expect(LOW_STOCK_THRESHOLD).toBe(5);
  });

  it.each([
    [0, "out_of_stock"],
    [1, "low_stock"],
    [5, "low_stock"],
    [6, "in_stock"],
    [250, "in_stock"],
  ] as const)("quantity %i is %s", (quantity, status) => {
    expect(getStockStatus(quantity)).toBe(status);
  });

  it.each([-1, 2.5, Number.NaN])("throws on invalid quantity %s", (quantity) => {
    expect(() => getStockStatus(quantity)).toThrow(RangeError);
  });
});

describe("stockLabel", () => {
  it.each([
    [0, "Out of stock"],
    [1, "Low stock: 1 left"],
    [5, "Low stock: 5 left"],
    [6, "6 in stock"],
    [12, "12 in stock"],
  ])("quantity %i reads %s", (quantity, label) => {
    expect(stockLabel(quantity)).toBe(label);
  });
});
