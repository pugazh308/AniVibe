import { describe, expect, it } from "vitest";
import { SAMPLE_PRODUCTS } from "@/data/sample-products";
import { DEFAULT_CATALOG_QUERY } from "./query";
import {
  findProducts,
  getAllProductSlugs,
  getCategories,
  getHomepageSelection,
  getProductById,
  getProductBySlug,
} from "./repository";

describe("repository", () => {
  it("returns the four categories", async () => {
    expect((await getCategories()).map((c) => c.slug)).toEqual([
      "miniatures",
      "posters",
      "stickers",
      "keychains",
    ]);
  });

  it("findProducts returns every product for the default query", async () => {
    expect(await findProducts(DEFAULT_CATALOG_QUERY)).toHaveLength(SAMPLE_PRODUCTS.length);
  });

  it("findProducts applies the query", async () => {
    const posters = await findProducts({ ...DEFAULT_CATALOG_QUERY, category: "posters" });
    expect(posters.length).toBeGreaterThan(0);
    expect(posters.every((p) => p.category === "posters")).toBe(true);
  });

  it("homepage selection has one in-stock product per category, in category order", async () => {
    const selection = await getHomepageSelection();
    expect(selection.map((p) => p.category)).toEqual(["miniatures", "posters", "stickers", "keychains"]);
    expect(selection.every((p) => p.stockQuantity > 0)).toBe(true);
  });

  it("looks products up by slug and id", async () => {
    const first = SAMPLE_PRODUCTS[0];
    expect(await getProductBySlug(first.slug)).toEqual(first);
    expect(await getProductById(first.id)).toEqual(first);
  });

  it("returns null for unknown slugs and ids", async () => {
    expect(await getProductBySlug("does-not-exist")).toBeNull();
    expect(await getProductById("NOPE")).toBeNull();
  });

  it("lists every slug exactly once", async () => {
    const slugs = await getAllProductSlugs();
    expect(slugs).toHaveLength(SAMPLE_PRODUCTS.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
