import Image from "next/image";
import type { Product } from "@/lib/catalog/types";
import { PlaceholderArt, placeholderStyleFor } from "./PlaceholderArt";

interface ProductMediaProps {
  product: Product;
  /** `sizes` hint for real photos (next/image), matching the layout the image sits in. */
  sizes: string;
  /** The main image of the page (likely the LCP element): load it eagerly at high priority. */
  prominent?: boolean;
}

/**
 * Product image slot with a fixed 4:5 ratio. Shows the product photo when one
 * exists; otherwise a category placeholder that is visibly and audibly marked
 * as a placeholder (and as sample data, for sample products).
 */
export function ProductMedia({ product, sizes, prominent = false }: ProductMediaProps) {
  if (product.image) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-ui bg-paper">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={sizes}
          loading={prominent ? "eager" : "lazy"}
          fetchPriority={prominent ? "high" : "auto"}
          className="object-cover"
        />
        {product.isSample && (
          <span className="absolute bottom-3 left-3 bg-ivory/90 px-1.5 py-1 text-[10px] leading-none tracking-[0.14em] text-muted uppercase">
            Sample
          </span>
        )}
      </div>
    );
  }

  return (
    <PlaceholderArt
      category={product.category}
      {...placeholderStyleFor(product.id)}
      label={`Placeholder illustration for ${product.name}${product.isSample ? " (sample product)" : ""}. Not a product photo.`}
      caption={product.isSample ? "Sample · placeholder" : "Placeholder"}
    />
  );
}
