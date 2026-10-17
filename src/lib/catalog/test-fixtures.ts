import type { Product } from "./types";

/** Builds a valid product for tests; override only what a test cares about. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  const id = overrides.id ?? "TEST-001";
  return {
    id,
    slug: id.toLowerCase(),
    name: "Test Product",
    category: "stickers",
    pricePaise: 10000,
    stockQuantity: 10,
    description: "A product used in tests.",
    specs: [{ label: "Size", value: "Small" }],
    isSample: true,
    ...overrides,
  };
}
