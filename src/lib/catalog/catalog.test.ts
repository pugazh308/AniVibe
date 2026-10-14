import { describe, expect, it } from "vitest";
import { filterProducts, queryCatalog, searchProducts, selectOnePerCategory, sortProducts } from "./catalog";
import { DEFAULT_CATALOG_QUERY } from "./query";
import { makeProduct } from "./test-fixtures";
import type { CatalogQuery, Product } from "./types";

const fox = makeProduct({
  id: "T-1",
  name: "Moonlit Fox Spirit Figure",
  category: "miniatures",
  pricePaise: 89900,
  stockQuantity: 3,
});
const sticker = makeProduct({
  id: "T-2",
  name: "Chibi Cat Ninja Sticker",
  category: "stickers",
  pricePaise: 4950,
  stockQuantity: 40,
});
const poster = makeProduct({
  id: "T-3",
  name: "Starfall Shrine Poster",
  category: "posters",
  pricePaise: 19900,
  stockQuantity: 0,
});
const keychain = makeProduct({
  id: "T-4",
  name: "Koi Pond Keychain",
  category: "keychains",
  pricePaise: 19900,
  stockQuantity: 11,
});
const accented = makeProduct({
  id: "T-5",
  name: "Pokémon-style Café Sticker",
  category: "stickers",
  pricePaise: 5000,
  stockQuantity: 2,
});

const ALL: readonly Product[] = [fox, sticker, poster, keychain, accented];
const ids = (products: readonly Product[]) => products.map((p) => p.id);
const filters = (overrides: Partial<CatalogQuery>) => ({ ...DEFAULT_CATALOG_QUERY, ...overrides });

describe("searchProducts", () => {
  it("returns everything (as a copy) for empty search", () => {
    const result = searchProducts(ALL, "");
    expect(ids(result)).toEqual(ids(ALL));
    expect(result).not.toBe(ALL);
  });

  it("is case-insensitive", () => {
    expect(ids(searchProducts(ALL, "FOX"))).toEqual(["T-1"]);
  });

  it("requires every token to match (AND), in any order", () => {
    expect(ids(searchProducts(ALL, "spirit moonlit"))).toEqual(["T-1"]);
    expect(ids(searchProducts(ALL, "fox poster"))).toEqual([]);
  });

  it("matches partial words", () => {
    expect(ids(searchProducts(ALL, "shri"))).toEqual(["T-3"]);
  });

  it("is accent-insensitive in both directions", () => {
    expect(ids(searchProducts(ALL, "pokemon cafe"))).toEqual(["T-5"]);
    expect(ids(searchProducts(ALL, "Pokémon"))).toEqual(["T-5"]);
  });

  it.each([
    ["posters", ["T-3"]],
    ["keychains", ["T-4"]],
    ["stickers", ["T-2", "T-5"]],
    ["figures", ["T-1"]],
    ["Posters", ["T-3"]],
  ])("finds singular names from the plural %j", (q, expected) => {
    expect(ids(searchProducts(ALL, q))).toEqual(expected);
  });

  it("does not strip letters from short words", () => {
    const bus = makeProduct({ id: "T-8", name: "Bus Stop Poster" });
    const bubble = makeProduct({ id: "T-9", name: "Bubble Sticker" });
    expect(ids(searchProducts([bus, bubble], "bus"))).toEqual(["T-8"]);
    expect(ids(searchProducts([bus, bubble], "bu"))).toEqual(["T-8", "T-9"]);
  });

  it("ignores invisible format characters in names", () => {
    const soft = makeProduct({ id: "T-7", name: "Fo\u00ADx Charm" });
    expect(ids(searchProducts([soft], "fox"))).toEqual(["T-7"]);
  });

  it("keeps Indic vowel signs significant (only Latin accents are folded)", () => {
    // "कार" (car) must not match "कर" (a different word) by dropping the vowel sign.
    const hindi = makeProduct({ id: "T-6", name: "कार कीचेन" });
    expect(ids(searchProducts([hindi], "कार"))).toEqual(["T-6"]);
    expect(ids(searchProducts([hindi], "कर"))).toEqual([]);
    expect(ids(searchProducts([fox], "ि"))).toEqual([]);
  });

  it("searches the name only, not the description or category", () => {
    const described = makeProduct({ id: "T-9", name: "Plain", description: "fox" });
    expect(ids(searchProducts([described], "fox"))).toEqual([]);
    expect(ids(searchProducts(ALL, "miniatures"))).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(searchProducts(ALL, "zzzz")).toEqual([]);
  });
});

describe("filterProducts", () => {
  it("filters by category", () => {
    expect(ids(filterProducts(ALL, filters({ category: "stickers" })))).toEqual(["T-2", "T-5"]);
  });

  it("treats price bounds as inclusive", () => {
    expect(ids(filterProducts(ALL, filters({ minPriceRupees: 199, maxPriceRupees: 199 })))).toEqual([
      "T-3",
      "T-4",
    ]);
  });

  it("compares in paise: ₹49.50 is excluded by max ₹49 and included by max ₹50", () => {
    expect(ids(filterProducts([sticker], filters({ maxPriceRupees: 49 })))).toEqual([]);
    expect(ids(filterProducts([sticker], filters({ maxPriceRupees: 50 })))).toEqual(["T-2"]);
    expect(ids(filterProducts([sticker], filters({ minPriceRupees: 50 })))).toEqual([]);
    expect(ids(filterProducts([sticker], filters({ minPriceRupees: 49 })))).toEqual(["T-2"]);
  });

  it("supports open-ended ranges and a zero minimum", () => {
    expect(ids(filterProducts(ALL, filters({ minPriceRupees: 500 })))).toEqual(["T-1"]);
    expect(filterProducts(ALL, filters({ minPriceRupees: 0 }))).toHaveLength(ALL.length);
  });

  it("hides out-of-stock products when inStockOnly is set", () => {
    const result = filterProducts(ALL, filters({ inStockOnly: true }));
    expect(ids(result)).not.toContain("T-3");
    expect(result.every((p) => p.stockQuantity > 0)).toBe(true);
  });

  it("combines filters with AND", () => {
    expect(
      ids(
        filterProducts(
          ALL,
          filters({ category: "posters", inStockOnly: true, minPriceRupees: 100 }),
        ),
      ),
    ).toEqual([]);
    expect(
      ids(filterProducts(ALL, filters({ category: "keychains", maxPriceRupees: 199 }))),
    ).toEqual(["T-4"]);
  });

  it("does not mutate its input", () => {
    const input = [...ALL];
    filterProducts(input, filters({ category: "posters" }));
    expect(ids(input)).toEqual(ids(ALL));
  });
});

describe("sortProducts", () => {
  it("featured keeps the original order", () => {
    expect(ids(sortProducts(ALL, "featured"))).toEqual(ids(ALL));
  });

  it("sorts by price ascending, breaking ties by name", () => {
    // T-3 "Starfall..." and T-4 "Koi..." are both ₹199 → Koi first.
    expect(ids(sortProducts(ALL, "price-asc"))).toEqual(["T-2", "T-5", "T-4", "T-3", "T-1"]);
  });

  it("sorts by price descending, breaking ties by name", () => {
    expect(ids(sortProducts(ALL, "price-desc"))).toEqual(["T-1", "T-4", "T-3", "T-5", "T-2"]);
  });

  it("sorts by name A–Z, case-insensitively", () => {
    const lower = makeProduct({ id: "T-6", name: "apple Sticker" });
    expect(ids(sortProducts([...ALL, lower], "name-asc"))).toEqual([
      "T-6",
      "T-2",
      "T-4",
      "T-1",
      "T-5",
      "T-3",
    ]);
  });

  it("orders numbers naturally (2 before 10)", () => {
    const a = makeProduct({ id: "A", name: "Pack 10" });
    const b = makeProduct({ id: "B", name: "Pack 2" });
    expect(ids(sortProducts([a, b], "name-asc"))).toEqual(["B", "A"]);
  });

  it("breaks full ties deterministically by id", () => {
    const a = makeProduct({ id: "B-2", name: "Same", pricePaise: 100 });
    const b = makeProduct({ id: "B-1", name: "Same", pricePaise: 100 });
    expect(ids(sortProducts([a, b], "price-asc"))).toEqual(["B-1", "B-2"]);
    expect(ids(sortProducts([b, a], "price-asc"))).toEqual(["B-1", "B-2"]);
  });

  it("returns a new array and does not mutate its input", () => {
    const input = [...ALL];
    const result = sortProducts(input, "price-desc");
    expect(result).not.toBe(input);
    expect(ids(input)).toEqual(ids(ALL));
  });
});

describe("selectOnePerCategory", () => {
  const order = ["miniatures", "posters", "stickers", "keychains"] as const;

  it("picks the first in-stock product of each category, in category order", () => {
    expect(ids(selectOnePerCategory(ALL, order))).toEqual(["T-1", "T-3", "T-2", "T-4"]);
  });

  it("prefers an in-stock product over an earlier out-of-stock one", () => {
    const soldOut = makeProduct({ id: "S-1", category: "posters", stockQuantity: 0 });
    const available = makeProduct({ id: "S-2", category: "posters", stockQuantity: 4 });
    expect(ids(selectOnePerCategory([soldOut, available], ["posters"]))).toEqual(["S-2"]);
  });

  it("falls back to the first product when a category is entirely out of stock", () => {
    // T-3 is the only poster and is out of stock.
    expect(ids(selectOnePerCategory(ALL, ["posters"]))).toEqual(["T-3"]);
  });

  it("skips categories with no products", () => {
    expect(selectOnePerCategory([], order)).toEqual([]);
  });
});

describe("queryCatalog", () => {
  it("applies search, then filters, then sort", () => {
    const result = queryCatalog(ALL, {
      ...DEFAULT_CATALOG_QUERY,
      q: "sticker",
      inStockOnly: true,
      sort: "price-desc",
    });
    expect(ids(result)).toEqual(["T-5", "T-2"]);
  });

  it("returns everything in featured order for the default query", () => {
    expect(ids(queryCatalog(ALL, DEFAULT_CATALOG_QUERY))).toEqual(ids(ALL));
  });
});
