import { describe, expect, it } from "vitest";
import { makeProduct } from "./test-fixtures";
import type { Product } from "./types";
import { assertValidProducts, validateProducts } from "./validate";

/** Casts a deliberately broken record past the type checker for runtime tests. */
function broken(overrides: Record<string, unknown>): Product {
  return { ...makeProduct(), ...overrides } as unknown as Product;
}

describe("validateProducts", () => {
  it("accepts valid products", () => {
    expect(validateProducts([makeProduct({ id: "A-1" }), makeProduct({ id: "A-2" })])).toEqual([]);
  });

  it("accepts products with a valid photo", () => {
    const withPhoto = makeProduct({
      id: "A-3",
      image: { src: "/images/products/a-3.jpg", alt: "A small figure on a wooden shelf" },
    });
    const webp = makeProduct({ id: "A-4", image: { src: "/images/posters/a_4.webp", alt: "A framed poster" } });
    expect(validateProducts([withPhoto, webp])).toEqual([]);
  });

  it("detects duplicate ids and slugs", () => {
    const errors = validateProducts([
      makeProduct({ id: "A-1", slug: "same" }),
      makeProduct({ id: "A-1", slug: "same" }),
    ]);
    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate slug"))).toBe(true);
  });

  it.each(["", "Has Caps", "trailing-", "-leading", "double--hyphen", "spa ce", "ünïcode"])(
    "rejects bad slug %j",
    (slug) => {
      expect(validateProducts([makeProduct({ slug })])).toHaveLength(1);
    },
  );

  it.each([
    ["empty id", { id: "" }],
    ["id with trailing space", { id: "A-1 " }],
    ["empty name", { name: "   " }],
    ["name with leading space", { name: " Fox Figure" }],
    ["price above the maximum", { pricePaise: 1_000_000_000 }],
    ["unknown category", { category: "figures" }],
    ["zero price", { pricePaise: 0 }],
    ["negative price", { pricePaise: -100 }],
    ["fractional price", { pricePaise: 49.5 }],
    ["string price", { pricePaise: "499" }],
    ["negative stock", { stockQuantity: -1 }],
    ["fractional stock", { stockQuantity: 1.5 }],
    ["NaN stock", { stockQuantity: Number.NaN }],
    ["empty description", { description: "" }],
    ["bad specs", { specs: [{ label: "Size", value: "" }] }],
    ["non-boolean isSample", { isSample: "yes" }],
    ["image without alt text", { image: { src: "/images/products/a.jpg", alt: "" } }],
    ["image on a remote host", { image: { src: "https://cdn.example.com/a.jpg", alt: "A figure" } }],
    ["image under /products (shadowed by product pages)", { image: { src: "/products/a.jpg", alt: "A figure" } }],
    ["image with a relative path", { image: { src: "images/a.jpg", alt: "A figure" } }],
    ["image that is not a photo format", { image: { src: "/images/a.svg", alt: "A figure" } }],
  ])("reports %s", (_label, overrides) => {
    expect(validateProducts([broken(overrides)]).length).toBeGreaterThan(0);
  });
});

describe("assertValidProducts", () => {
  it("throws listing every problem", () => {
    expect(() =>
      assertValidProducts([broken({ pricePaise: -1, stockQuantity: -1 })]),
    ).toThrow(/pricePaise[\s\S]*stockQuantity/);
  });

  it("does not throw for valid data", () => {
    expect(() => assertValidProducts([makeProduct()])).not.toThrow();
  });
});
