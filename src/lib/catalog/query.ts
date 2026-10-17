/**
 * Parses untrusted URL search params into a validated CatalogQuery.
 *
 * Rules:
 * - Every param: take the first value if repeated, trim it, and treat "" as
 *   absent (a plain GET form submits empty fields — that is not an error).
 * - Invalid values are ignored and reported as human-readable issues; parsing
 *   never throws, so bad input can never turn into a server error.
 * - Issue messages never echo the raw input back to the page.
 */

import { isCategorySlug } from "./categories";
import {
  SORT_OPTIONS,
  type CatalogQuery,
  type CategorySlug,
  type SortOption,
} from "./types";

/** Shape of Next.js `searchParams` once awaited. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Maximum search length, in user-perceived characters (grapheme clusters). */
export const SEARCH_MAX_LENGTH = 100;

/** Largest accepted price bound, in digits of whole rupees (up to ₹99,99,999). */
export const MAX_PRICE_DIGITS = 7;

/**
 * Whole rupees in ASCII digits, optionally written with zero paise: "250",
 * "250.0" and "250.00" all mean ₹250. Shared with the price inputs' HTML
 * `pattern` attribute (which flags a malformed value as you type) so the
 * browser and the server agree. HTML patterns are implicitly anchored.
 * Full-width or Devanagari digits, real paise, signs and exponents are
 * rejected rather than guessed at.
 */
export const WHOLE_RUPEES_INPUT_PATTERN = `[0-9]{1,${MAX_PRICE_DIGITS}}(\\.0{1,2})?`;
const WHOLE_RUPEES_PATTERN = new RegExp(`^(?:${WHOLE_RUPEES_INPUT_PATTERN})$`);

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  q: "",
  category: null,
  minPriceRupees: null,
  maxPriceRupees: null,
  inStockOnly: false,
  sort: "featured",
};

export interface ParsedCatalogQuery {
  readonly query: CatalogQuery;
  readonly issues: readonly string[];
}

function firstValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

/**
 * NFKC; control characters and zero-width spaces (word breaks) → space; other
 * invisible format characters (soft hyphen, direction marks, word joiner…)
 * removed — except zero-width (non-)joiners, which build emoji sequences and
 * Indic conjuncts; whitespace collapsed and trimmed.
 */
function cleanSearchText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\p{Cc}\u200B]/gu, " ")
    .replace(/(?![\u200C\u200D])\p{Cf}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

const graphemeSegmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/** Splits text into user-perceived characters, so emoji and flags stay whole. */
function graphemes(text: string): string[] {
  return Array.from(graphemeSegmenter.segment(text), (part) => part.segment);
}

function isSortOption(value: string): value is SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(value);
}

type PriceParse = { kind: "absent" } | { kind: "valid"; rupees: number } | { kind: "invalid" };

function parseWholeRupees(raw: string): PriceParse {
  if (raw === "") return { kind: "absent" };
  if (!WHOLE_RUPEES_PATTERN.test(raw)) return { kind: "invalid" };
  // parseInt stops at the "." of an all-zero paise suffix, so "250.00" → 250.
  return { kind: "valid", rupees: Number.parseInt(raw, 10) };
}

export function parseCatalogQuery(params: RawSearchParams): ParsedCatalogQuery {
  const issues: string[] = [];

  // Search text
  const searchCharacters = graphemes(cleanSearchText(firstValue(params.q)));
  const q = searchCharacters.slice(0, SEARCH_MAX_LENGTH).join("").trim();
  if (searchCharacters.length > SEARCH_MAX_LENGTH) {
    issues.push(`Search text was shortened to ${SEARCH_MAX_LENGTH} characters.`);
  }

  // Category
  let category: CategorySlug | null = null;
  const rawCategory = firstValue(params.category);
  if (rawCategory !== "") {
    if (isCategorySlug(rawCategory)) {
      category = rawCategory;
    } else {
      issues.push("That category doesn’t exist, so all categories are shown.");
    }
  }

  // Price range (whole rupees, inclusive)
  const min = parseWholeRupees(firstValue(params.min));
  const max = parseWholeRupees(firstValue(params.max));
  let minPriceRupees = min.kind === "valid" ? min.rupees : null;
  let maxPriceRupees = max.kind === "valid" ? max.rupees : null;
  if (min.kind === "invalid") {
    issues.push("Minimum price must be a whole number of rupees (digits only), so it was ignored.");
  }
  if (max.kind === "invalid") {
    issues.push("Maximum price must be a whole number of rupees (digits only), so it was ignored.");
  }
  if (minPriceRupees !== null && maxPriceRupees !== null && minPriceRupees > maxPriceRupees) {
    // Most likely entered the wrong way round: swap rather than discard them.
    issues.push("Minimum price was higher than maximum price, so the two were swapped.");
    [minPriceRupees, maxPriceRupees] = [maxPriceRupees, minPriceRupees];
  }

  // Stock filter: only the exact value the form sends counts as "on".
  const inStockOnly = firstValue(params.inStock) === "1";

  // Sort
  let sort: SortOption = "featured";
  const rawSort = firstValue(params.sort);
  if (rawSort !== "") {
    if (isSortOption(rawSort)) {
      sort = rawSort;
    } else {
      issues.push("Unknown sort order, so the default order is used.");
    }
  }

  return {
    query: { q, category, minPriceRupees, maxPriceRupees, inStockOnly, sort },
    issues,
  };
}

/**
 * Serialises a query back to URL params, omitting defaults, so that
 * `parseCatalogQuery(toSearchParams(q))` round-trips to the same query.
 */
export function toSearchParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q !== "") params.set("q", query.q);
  if (query.category !== null) params.set("category", query.category);
  if (query.minPriceRupees !== null) params.set("min", String(query.minPriceRupees));
  if (query.maxPriceRupees !== null) params.set("max", String(query.maxPriceRupees));
  if (query.inStockOnly) params.set("inStock", "1");
  if (query.sort !== DEFAULT_CATALOG_QUERY.sort) params.set("sort", query.sort);
  return params;
}

/**
 * Number of active refinements in the filter panel: a price range (either
 * bound) counts as one, "in stock only" as one. Search and category are shown
 * elsewhere and are not counted.
 */
export function countPanelFilters(query: CatalogQuery): number {
  const priceActive = query.minPriceRupees !== null || query.maxPriceRupees !== null;
  return (priceActive ? 1 : 0) + (query.inStockOnly ? 1 : 0);
}

/** The same query with the filter-panel refinements (price, stock) removed; search, category and sort are kept. */
export function clearPanelFilters(query: CatalogQuery): CatalogQuery {
  return { ...query, minPriceRupees: null, maxPriceRupees: null, inStockOnly: false };
}

/** Catalogue URL for a query, e.g. "/products?category=posters" ("/products" for the defaults). */
export function catalogHref(query: CatalogQuery): string {
  const params = toSearchParams(query).toString();
  return params === "" ? "/products" : `/products?${params}`;
}

/** True when the query has any search or filter beyond the defaults (sort excluded). */
export function hasActiveFilters(query: CatalogQuery): boolean {
  return (
    query.q !== "" ||
    query.category !== null ||
    query.minPriceRupees !== null ||
    query.maxPriceRupees !== null ||
    query.inStockOnly
  );
}
