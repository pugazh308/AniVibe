import { describe, expect, it } from "vitest";
import { MAX_PRICE_PAISE, formatPrice, isValidPaise, rupeesToPaise } from "./money";

describe("formatPrice", () => {
  it.each([
    [0, "₹0"],
    [4900, "₹49"],
    [4950, "₹49.50"],
    [149900, "₹1,499"],
    [149950, "₹1,499.50"],
    [149999, "₹1,499.99"],
    [10000000, "₹1,00,000"],
    [999999999, "₹99,99,999.99"],
  ])("formats %i paise as %s", (paise, expected) => {
    expect(formatPrice(paise)).toBe(expected);
  });

  it("never rounds paise away (₹1,499.50 must not become ₹1,500)", () => {
    expect(formatPrice(149950)).not.toBe("₹1,500");
  });

  it("formats the maximum allowed price exactly", () => {
    expect(formatPrice(MAX_PRICE_PAISE)).toBe("₹99,99,999.99");
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, MAX_PRICE_PAISE + 1, 4_503_599_627_370_497])(
    "throws on invalid paise %s",
    (paise) => {
      expect(() => formatPrice(paise)).toThrow(RangeError);
    },
  );
});

describe("isValidPaise", () => {
  it("accepts non-negative safe integers only", () => {
    expect(isValidPaise(0)).toBe(true);
    expect(isValidPaise(4950)).toBe(true);
    expect(isValidPaise(-1)).toBe(false);
    expect(isValidPaise(0.5)).toBe(false);
    expect(isValidPaise("100")).toBe(false);
  });
});

describe("rupeesToPaise", () => {
  it("converts whole rupees", () => {
    expect(rupeesToPaise(0)).toBe(0);
    expect(rupeesToPaise(499)).toBe(49900);
  });

  it.each([-1, 1.5, Number.NaN])("throws on %s", (rupees) => {
    expect(() => rupeesToPaise(rupees)).toThrow(RangeError);
  });
});
