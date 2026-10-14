import type { StockStatus } from "./types";

/** Quantities from 1 up to this value are shown as low stock. */
export const LOW_STOCK_THRESHOLD = 5;

function assertValidQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new RangeError(`Invalid stock quantity: ${String(quantity)}`);
  }
}

export function getStockStatus(quantity: number): StockStatus {
  assertValidQuantity(quantity);
  if (quantity === 0) return "out_of_stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

/** Shopper-facing label. Always states the exact count when stock exists. */
export function stockLabel(quantity: number): string {
  switch (getStockStatus(quantity)) {
    case "out_of_stock":
      return "Out of stock";
    case "low_stock":
      return `Low stock: ${quantity} left`;
    case "in_stock":
      return `${quantity} in stock`;
  }
}
