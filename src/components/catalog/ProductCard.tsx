import Link from "next/link";
import { PriceTag } from "@/components/product/PriceTag";
import { ProductMedia } from "@/components/product/ProductMedia";
import { StockBadge } from "@/components/product/StockBadge";
import { getCategory } from "@/lib/catalog/categories";
import type { Product } from "@/lib/catalog/types";

/** `sizes` for card images: 1 column on small phones, 2 on phones, 3–4 from tablet width. */
const CARD_IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 360px) 50vw, 100vw";

/**
 * A quiet listing card: the image leads, details sit beneath without a box.
 * The whole card is clickable through a stretched link on the title, so there
 * is one well-labelled link per product. Titles reserve two lines so prices
 * and stock labels align across a row.
 */
export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  return (
    <article
      data-slug={product.slug}
      data-price-paise={product.pricePaise}
      data-stock={product.stockQuantity}
      className="group relative flex h-full min-w-0 flex-col has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-wine"
    >
      <ProductMedia product={product} sizes={CARD_IMAGE_SIZES} />
      <div className="mt-4 flex min-w-0 flex-1 flex-col">
        <p className="eyebrow">{category.shortName}</p>
        <h3 className="mt-1.5 min-h-[2lh] text-[15px] leading-snug text-ink">
          <Link
            href={`/products/${product.slug}`}
            className="decoration-stone decoration-1 underline-offset-4 after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-2">
          <PriceTag pricePaise={product.pricePaise} />
          <StockBadge quantity={product.stockQuantity} />
        </div>
      </div>
    </article>
  );
}
