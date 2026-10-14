/**
 * Pure catalogue operations: search, filter, sort. No I/O and no mutation of
 * inputs — every function returns a new array.
 */

import { rupeesToPaise } from "./money";
import type { CatalogQuery, CategorySlug, Product, SortOption } from "./types";

// Fixed locale so ordering never depends on the server's default locale.
const nameCollator = new Intl.Collator("en-IN", { sensitivity: "base", numeric: true });

/**
 * Lower-cases, removes invisible format characters, and strips Latin
 * combining accents so "pokemon" matches "Pokémon". Only the U+0300–U+036F
 * block is stripped: Indic vowel signs and Japanese voicing marks change
 * meaning and are kept.
 */
function foldForSearch(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/\p{Cf}/gu, "")
    .normalize("NFKC")
    .toLowerCase();
}

/**
 * Forms of a search word to try, so the plural a shopper types ("posters",
 * "keychains", "figures") still finds singular product names.
 */
function tokenVariants(token: string): string[] {
  if (token.length <= 3) return [token];
  if (token.endsWith("es")) return [token, token.slice(0, -1), token.slice(0, -2)];
  if (token.endsWith("s")) return [token, token.slice(0, -1)];
  return [token];
}

/**
 * Matches products whose **name** contains every whitespace-separated word of
 * the search text (case- and accent-insensitive, plural-tolerant). Empty
 * search matches all.
 */
export function searchProducts(products: readonly Product[], searchText: string): Product[] {
  const tokens = foldForSearch(searchText).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [...products];
  return products.filter((product) => {
    const name = foldForSearch(product.name);
    return tokens.every((token) => tokenVariants(token).some((variant) => name.includes(variant)));
  });
}

export type CatalogFilters = Pick<
  CatalogQuery,
  "category" | "minPriceRupees" | "maxPriceRupees" | "inStockOnly"
>;

/** Applies category, inclusive price range and stock filters (combined with AND). */
export function filterProducts(products: readonly Product[], filters: CatalogFilters): Product[] {
  const minPaise = filters.minPriceRupees === null ? null : rupeesToPaise(filters.minPriceRupees);
  const maxPaise = filters.maxPriceRupees === null ? null : rupeesToPaise(filters.maxPriceRupees);
  return products.filter(
    (product) =>
      (filters.category === null || product.category === filters.category) &&
      (minPaise === null || product.pricePaise >= minPaise) &&
      (maxPaise === null || product.pricePaise <= maxPaise) &&
      (!filters.inStockOnly || product.stockQuantity > 0),
  );
}

function compareIds(a: Product, b: Product): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

function compareNames(a: Product, b: Product): number {
  return nameCollator.compare(a.name, b.name) || compareIds(a, b);
}

const comparators: Record<Exclude<SortOption, "featured">, (a: Product, b: Product) => number> = {
  "price-asc": (a, b) => a.pricePaise - b.pricePaise || compareNames(a, b),
  "price-desc": (a, b) => b.pricePaise - a.pricePaise || compareNames(a, b),
  "name-asc": compareNames,
};

/** Sorts a copy. "featured" keeps the curated catalogue order. */
export function sortProducts(products: readonly Product[], sort: SortOption): Product[] {
  const copy = [...products];
  if (sort === "featured") return copy;
  return copy.sort(comparators[sort]);
}

/**
 * One product per category, in the given category order: the first in-stock
 * product of each category (catalogue order), or its first product if none
 * are in stock. Categories with no products are skipped.
 */
export function selectOnePerCategory(
  products: readonly Product[],
  categoryOrder: readonly CategorySlug[],
): Product[] {
  return categoryOrder.flatMap((slug) => {
    const inCategory = products.filter((product) => product.category === slug);
    const pick = inCategory.find((product) => product.stockQuantity > 0) ?? inCategory[0];
    return pick ? [pick] : [];
  });
}

/** Full pipeline: search → filter → sort. */
export function queryCatalog(products: readonly Product[], query: CatalogQuery): Product[] {
  return sortProducts(filterProducts(searchProducts(products, query.q), query), query.sort);
}
