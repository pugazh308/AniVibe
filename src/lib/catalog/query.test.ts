import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATALOG_QUERY,
  SEARCH_MAX_LENGTH,
  WHOLE_RUPEES_INPUT_PATTERN,
  catalogHref,
  clearPanelFilters,
  countPanelFilters,
  hasActiveFilters,
  parseCatalogQuery,
  toSearchParams,
  type RawSearchParams,
} from "./query";
import type { CatalogQuery } from "./types";

function parse(params: RawSearchParams) {
  return parseCatalogQuery(params);
}

describe("parseCatalogQuery — defaults and empty input", () => {
  it("returns defaults with no issues for no params", () => {
    expect(parse({})).toEqual({ query: DEFAULT_CATALOG_QUERY, issues: [] });
  });

  it("treats an all-empty GET form submission as defaults with NO issues", () => {
    const result = parse({ q: "", category: "", min: "", max: "", sort: "featured" });
    expect(result.issues).toEqual([]);
    expect(result.query).toEqual(DEFAULT_CATALOG_QUERY);
  });

  it("treats whitespace-only values as absent", () => {
    const result = parse({ q: "   ", category: "  ", min: " ", max: "\t" });
    expect(result.issues).toEqual([]);
    expect(result.query).toEqual(DEFAULT_CATALOG_QUERY);
  });

  it("ignores unknown params", () => {
    expect(parse({ utm_source: "x", page: "2" }).issues).toEqual([]);
  });
});

describe("parseCatalogQuery — repeated params", () => {
  it("takes the first value of an array", () => {
    expect(parse({ category: ["posters", "stickers"] }).query.category).toBe("posters");
  });

  it("first value wins even when it is empty (URLSearchParams.get semantics)", () => {
    const result = parse({ category: ["", "posters"] });
    expect(result.query.category).toBeNull();
    expect(result.issues).toEqual([]);
  });

  it("handles an empty array as absent", () => {
    expect(parse({ category: [] }).query.category).toBeNull();
  });
});

describe("parseCatalogQuery — search text", () => {
  it("trims and collapses whitespace", () => {
    expect(parse({ q: "  crimson    ronin \n" }).query.q).toBe("crimson ronin");
  });

  it("applies NFKC normalisation (full-width letters become ASCII)", () => {
    expect(parse({ q: "ＲＯＮＩＮ" }).query.q).toBe("RONIN");
  });

  it("removes control characters", () => {
    expect(parse({ q: "fox\u0000spirit" }).query.q).toBe("fox spirit");
  });

  it("treats a zero-width space as a word break", () => {
    expect(parse({ q: "fox\u200Bspirit" }).query.q).toBe("fox spirit");
    expect(parse({ q: "fox\u200B" }).query.q).toBe("fox");
  });

  it("keeps zero-width joiners, which emoji sequences and Indic conjuncts need", () => {
    expect(parse({ q: "👨\u200D👩\u200D👧" }).query.q).toBe("👨\u200D👩\u200D👧");
    expect(parse({ q: "क्\u200Dष" }).query.q).toBe("क्\u200Dष");
  });

  it.each([
    ["soft hyphen", "fo\u00ADx"],
    ["left-to-right mark", "fox\u200E"],
    ["word joiner", "\u2060fox"],
    ["BOM", "\uFEFFfox"],
  ])("removes invisible %s", (_name, q) => {
    expect(parse({ q }).query.q).toBe("fox");
  });

  it("caps at the max length in code points and reports it", () => {
    const result = parse({ q: "a".repeat(SEARCH_MAX_LENGTH + 50) });
    expect(Array.from(result.query.q)).toHaveLength(SEARCH_MAX_LENGTH);
    expect(result.issues).toHaveLength(1);
  });

  it("does not report text exactly at the limit", () => {
    const result = parse({ q: "a".repeat(SEARCH_MAX_LENGTH) });
    expect(result.query.q).toHaveLength(SEARCH_MAX_LENGTH);
    expect(result.issues).toEqual([]);
  });

  it.each([
    ["emoji", "🦊"],
    ["flag (two code points)", "🇮🇳"],
    ["ZWJ family sequence", "👨\u200D👩\u200D👧"],
  ])("never splits a %s when truncating", (_name, character) => {
    const result = parse({ q: character.repeat(SEARCH_MAX_LENGTH + 1) });
    expect(result.query.q).toBe(character.repeat(SEARCH_MAX_LENGTH));
    expect(result.issues).toHaveLength(1);
  });
});

describe("parseCatalogQuery — category", () => {
  it.each(["miniatures", "posters", "stickers", "keychains"])("accepts %s", (slug) => {
    const result = parse({ category: slug });
    expect(result.query.category).toBe(slug);
    expect(result.issues).toEqual([]);
  });

  it.each(["figures", "POSTERS", "posters ", "<script>"])(
    "ignores unknown category %j with an issue",
    (category) => {
      const result = parse({ category });
      // "posters " is trimmed to a valid slug; the rest are rejected.
      if (category.trim() === "posters") {
        expect(result.query.category).toBe("posters");
        return;
      }
      expect(result.query.category).toBeNull();
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).not.toContain(category);
    },
  );
});

describe("parseCatalogQuery — price range", () => {
  it.each([
    ["500", 500],
    [" 500 ", 500],
    ["0500", 500],
    ["0", 0],
    ["9999999", 9_999_999],
    ["250.00", 250],
    ["250.0", 250],
    ["0.00", 0],
  ])("accepts min=%j as %i rupees", (raw, rupees) => {
    const result = parse({ min: raw });
    expect(result.query.minPriceRupees).toBe(rupees);
    expect(result.issues).toEqual([]);
  });

  it.each([
    "abc",
    "-5",
    "+500",
    "12.5",
    "250.50", // real paise: bounds are whole rupees
    "250.000",
    "250.",
    ".5",
    "1e3",
    "10000000", // 8 digits
    "1,000",
    "５００", // full-width digits
    "५००", // Devanagari digits
    "Infinity",
    "0x10",
  ])("rejects max=%j with an issue that does not echo the input", (raw) => {
    const result = parse({ max: raw });
    expect(result.query.maxPriceRupees).toBeNull();
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).not.toContain(raw);
  });

  it("swaps the bounds with one issue when min > max", () => {
    const result = parse({ min: "500", max: "100" });
    expect(result.query.minPriceRupees).toBe(100);
    expect(result.query.maxPriceRupees).toBe(500);
    expect(result.issues).toHaveLength(1);
  });

  it.each([
    ["250.00", true],
    ["500.0", true],
    ["-0", false],
    ["1e3", false],
    ["12.5", false],
  ])("the price inputs' HTML pattern agrees with the server for %j (valid: %s)", (raw, valid) => {
    expect(new RegExp(`^(?:${WHOLE_RUPEES_INPUT_PATTERN})$`).test(raw)).toBe(valid);
    expect(parse({ max: raw }).query.maxPriceRupees !== null).toBe(valid);
  });

  it("allows min == max", () => {
    const result = parse({ min: "199", max: "199" });
    expect(result.query.minPriceRupees).toBe(199);
    expect(result.query.maxPriceRupees).toBe(199);
    expect(result.issues).toEqual([]);
  });

  it("keeps the valid bound when the other is invalid", () => {
    const result = parse({ min: "100", max: "lots" });
    expect(result.query.minPriceRupees).toBe(100);
    expect(result.query.maxPriceRupees).toBeNull();
    expect(result.issues).toHaveLength(1);
  });
});

describe("parseCatalogQuery — stock and sort", () => {
  it.each([
    ["1", true],
    ["on", false],
    ["true", false],
    ["0", false],
    ["", false],
  ])("inStock=%j → %s", (raw, expected) => {
    expect(parse({ inStock: raw }).query.inStockOnly).toBe(expected);
  });

  it.each(["featured", "price-asc", "price-desc", "name-asc"])("accepts sort=%s", (sort) => {
    const result = parse({ sort });
    expect(result.query.sort).toBe(sort);
    expect(result.issues).toEqual([]);
  });

  it("falls back to featured on unknown sort with an issue", () => {
    const result = parse({ sort: "cheapest" });
    expect(result.query.sort).toBe("featured");
    expect(result.issues).toHaveLength(1);
  });
});

describe("toSearchParams", () => {
  it("omits defaults entirely", () => {
    expect(toSearchParams(DEFAULT_CATALOG_QUERY).toString()).toBe("");
  });

  it("round-trips through parseCatalogQuery", () => {
    const query: CatalogQuery = {
      q: "fox spirit",
      category: "miniatures",
      minPriceRupees: 0,
      maxPriceRupees: 1500,
      inStockOnly: true,
      sort: "price-desc",
    };
    const params = Object.fromEntries(toSearchParams(query));
    expect(parse(params)).toEqual({ query, issues: [] });
  });
});

describe("clearPanelFilters and catalogHref", () => {
  const query: CatalogQuery = {
    q: "fox",
    category: "miniatures",
    minPriceRupees: 100,
    maxPriceRupees: 2000,
    inStockOnly: true,
    sort: "price-asc",
  };

  it("drops price and stock but keeps search, category and sort", () => {
    expect(clearPanelFilters(query)).toEqual({
      ...query,
      minPriceRupees: null,
      maxPriceRupees: null,
      inStockOnly: false,
    });
    expect(catalogHref(clearPanelFilters(query))).toBe("/products?q=fox&category=miniatures&sort=price-asc");
  });

  it("links the default query to plain /products", () => {
    expect(catalogHref(DEFAULT_CATALOG_QUERY)).toBe("/products");
  });
});

describe("countPanelFilters", () => {
  it("counts a price range once and in-stock once; ignores search, category and sort", () => {
    expect(countPanelFilters(DEFAULT_CATALOG_QUERY)).toBe(0);
    expect(countPanelFilters({ ...DEFAULT_CATALOG_QUERY, q: "fox", category: "posters", sort: "name-asc" })).toBe(0);
    expect(countPanelFilters({ ...DEFAULT_CATALOG_QUERY, minPriceRupees: 0 })).toBe(1);
    expect(countPanelFilters({ ...DEFAULT_CATALOG_QUERY, minPriceRupees: 100, maxPriceRupees: 500 })).toBe(1);
    expect(countPanelFilters({ ...DEFAULT_CATALOG_QUERY, maxPriceRupees: 500, inStockOnly: true })).toBe(2);
  });
});

describe("hasActiveFilters", () => {
  it("is false for defaults and for sort-only changes", () => {
    expect(hasActiveFilters(DEFAULT_CATALOG_QUERY)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_QUERY, sort: "price-asc" })).toBe(false);
  });

  it("is true when any filter is set", () => {
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_QUERY, q: "x" })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_QUERY, minPriceRupees: 0 })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_CATALOG_QUERY, inStockOnly: true })).toBe(true);
  });
});

describe("search text normalisation", () => {
  it("is idempotent (re-parsing a parsed query changes nothing)", () => {
    const once = parse({ q: "  ＦＯＸ   spirit " }).query.q;
    expect(parse({ q: once }).query.q).toBe(once);
  });
});
