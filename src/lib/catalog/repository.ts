/**
 * Catalogue data access — the single seam between the UI and product storage.
 *
 * Phase 1 is backed by in-memory sample data. To move to a database, replace
 * the bodies of these functions (e.g. turn `findProducts` into a SQL query)
 * and keep the signatures, so components need no changes. One page does:
 * product detail pages are prebuilt at build time (see
 * app/products/[slug]/page.tsx), which would freeze database price and stock,
 * so they must switch to on-demand rendering or revalidation at that point.
 *
 * SECURITY (future cart/checkout): never trust a price sent by the browser.
 * Re-read each line item with `getProductById` on the server and charge the
 * `pricePaise` returned here.
 */

import { SAMPLE_PRODUCTS } from "@/data/sample-products";
import { queryCatalog, selectOnePerCategory } from "./catalog";
import { CATEGORIES } from "./categories";
import type { CatalogQuery, Category, Product } from "./types";
import { assertValidProducts } from "./validate";

let validatedProducts: readonly Product[] | null = null;

/** Validates once, then serves from memory. Throws on invalid data (fails the build). */
function loadProducts(): readonly Product[] {
  if (validatedProducts === null) {
    assertValidProducts(SAMPLE_PRODUCTS);
    validatedProducts = SAMPLE_PRODUCTS;
  }
  return validatedProducts;
}

export async function getCategories(): Promise<readonly Category[]> {
  return CATEGORIES;
}

/** Search, filter and sort the catalogue. */
export async function findProducts(query: CatalogQuery): Promise<Product[]> {
  return queryCatalog(loadProducts(), query);
}

/** A small cross-section for the home page: one product from each category. */
export async function getHomepageSelection(): Promise<Product[]> {
  return selectOnePerCategory(
    loadProducts(),
    CATEGORIES.map((category) => category.slug),
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return loadProducts().find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return loadProducts().find((product) => product.id === id) ?? null;
}

export async function getAllProductSlugs(): Promise<string[]> {
  return loadProducts().map((product) => product.slug);
}
