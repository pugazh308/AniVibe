import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/catalog/categories";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog/stock";
import { CATEGORY_SLUGS } from "@/lib/catalog/types";
import { validateProducts } from "@/lib/catalog/validate";
import { SAMPLE_PRODUCTS } from "./sample-products";

describe("sample product data", () => {
  it("passes validation", () => {
    expect(validateProducts(SAMPLE_PRODUCTS)).toEqual([]);
  });

  it("is clearly marked as sample data", () => {
    for (const product of SAMPLE_PRODUCTS) {
      expect(product.isSample).toBe(true);
      expect(product.id.startsWith("SAMPLE-")).toBe(true);
    }
  });

  it("covers every category", () => {
    for (const slug of CATEGORY_SLUGS) {
      expect(SAMPLE_PRODUCTS.some((p) => p.category === slug)).toBe(true);
    }
  });

  it("exercises every stock state the UI must render", () => {
    const quantities = SAMPLE_PRODUCTS.map((p) => p.stockQuantity);
    expect(quantities).toContain(0);
    expect(quantities).toContain(1);
    expect(quantities).toContain(LOW_STOCK_THRESHOLD);
    expect(quantities).toContain(LOW_STOCK_THRESHOLD + 1);
  });

  it("includes a price with paise and at least one price tie", () => {
    const prices = SAMPLE_PRODUCTS.map((p) => p.pricePaise);
    expect(prices.some((p) => p % 100 !== 0)).toBe(true);
    expect(new Set(prices).size).toBeLessThan(prices.length);
  });

  it("does not use franchise-style claims in names or descriptions", () => {
    const banned = /official|licen[cs]ed|authentic|genuine|original|exclusive|limited edition|bestseller|trending|% off|sale/i;
    for (const p of SAMPLE_PRODUCTS) {
      expect(p.name).not.toMatch(banned);
      expect(p.description).not.toMatch(banned);
    }
  });
});

describe("category definitions", () => {
  it("lists exactly the four category slugs, in order", () => {
    expect(CATEGORIES.map((c) => c.slug)).toEqual([...CATEGORY_SLUGS]);
  });
});
