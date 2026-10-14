import type { Product } from "@/lib/catalog/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: readonly Product[];
  /** Wider layouts: 3 columns from 768px (catalogue), or 4 from 1024px (full-width home section). */
  wideColumns?: 3 | 4;
}

const wideClass = { 3: "md:grid-cols-3", 4: "lg:grid-cols-4" } as const;

export function ProductGrid({ products, wideColumns = 3 }: ProductGridProps) {
  return (
    <ul
      role="list"
      className={`grid grid-cols-1 gap-x-5 gap-y-12 min-[360px]:grid-cols-2 sm:gap-x-8 sm:gap-y-14 ${wideClass[wideColumns]}`}
    >
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
