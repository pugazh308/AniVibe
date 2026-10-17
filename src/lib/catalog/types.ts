/**
 * Core catalogue types. These are framework-free so the same shapes can back
 * a database schema, an API response or a server action later.
 */

export const CATEGORY_SLUGS = [
  "miniatures",
  "posters",
  "stickers",
  "keychains",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  readonly slug: CategorySlug;
  /** Full display name, e.g. "Anime Miniatures". */
  readonly name: string;
  /** Compact label for navigation pills. */
  readonly shortName: string;
  readonly description: string;
}

export interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

/** A real product photograph. Until one exists, the UI shows a labelled placeholder. */
export interface ProductPhoto {
  /**
   * Path of a file under public/images/, e.g. "/images/products/crimson-ronin.jpg".
   * (Not "/products/…" — that path belongs to the product pages. Remote https
   * images would also need `images.remotePatterns` in next.config.ts first.)
   */
  readonly src: string;
  /** Describes what the photo shows, for screen-reader users. */
  readonly alt: string;
}

export interface Product {
  /** Stable identifier (future primary key / SKU). Sample items use a `SAMPLE-` prefix. */
  readonly id: string;
  /** URL segment for /products/[slug]: lowercase letters, digits and single hyphens. */
  readonly slug: string;
  readonly name: string;
  readonly category: CategorySlug;
  /** Selling price in paise (₹1 = 100 paise). Always an integer — never a float. */
  readonly pricePaise: number;
  /** Units on hand. Stock status is derived from this, never stored separately. */
  readonly stockQuantity: number;
  readonly description: string;
  readonly specs: readonly ProductSpec[];
  /** Optional product photograph; absent until real inventory is photographed. */
  readonly image?: ProductPhoto;
  /** True for placeholder entries that are not real inventory. */
  readonly isSample: boolean;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export const SORT_OPTIONS = [
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

/** A validated, normalised catalogue query (search + filters + sort). */
export interface CatalogQuery {
  /** Normalised search text; "" means no search. */
  readonly q: string;
  readonly category: CategorySlug | null;
  /** Inclusive lower price bound in whole rupees, or null for none. */
  readonly minPriceRupees: number | null;
  /** Inclusive upper price bound in whole rupees, or null for none. */
  readonly maxPriceRupees: number | null;
  readonly inStockOnly: boolean;
  readonly sort: SortOption;
}
