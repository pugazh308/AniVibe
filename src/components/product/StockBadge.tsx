import { getStockStatus, stockLabel } from "@/lib/catalog/stock";
import type { StockStatus } from "@/lib/catalog/types";

// Quiet, text-first stock status: the words carry the meaning; colour only
// adds emphasis (wine for low stock), so it never relies on colour alone.
const textClass: Record<StockStatus, string> = {
  in_stock: "text-muted",
  low_stock: "text-wine",
  out_of_stock: "text-muted",
};

const markClass: Record<StockStatus, string> = {
  in_stock: "bg-stone",
  low_stock: "bg-wine",
  out_of_stock: "border border-stone bg-transparent",
};

/** Stock status with the exact count when in stock. */
export function StockBadge({ quantity }: { quantity: number }) {
  const status = getStockStatus(quantity);
  return (
    <p data-stock-status={status} className={`inline-flex items-center gap-2 text-[13px] leading-snug ${textClass[status]}`}>
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${markClass[status]}`} />
      {stockLabel(quantity)}
    </p>
  );
}
