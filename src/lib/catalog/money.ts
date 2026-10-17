/**
 * Money handling. Prices are stored as integer paise so no floating-point
 * arithmetic ever touches an amount; conversion to rupees happens only at
 * the formatting boundary.
 */

export const STORE_CURRENCY = "INR";
export const PAISE_PER_RUPEE = 100;

// `stripIfInteger` gives "₹1,499" but keeps "₹49.50". Never use
// `maximumFractionDigits: 0` here — it would round ₹1,499.50 up to ₹1,500.
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: STORE_CURRENCY,
  trailingZeroDisplay: "stripIfInteger",
});

/**
 * Upper bound for any single price: ₹99,99,999.99. Far above anything this
 * store sells, and well inside the range where paise → rupees conversion is
 * exact in floating point.
 */
export const MAX_PRICE_PAISE = 999_999_999;

/** True for an integer amount of paise from 0 to MAX_PRICE_PAISE. */
export function isValidPaise(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_PRICE_PAISE;
}

/** Formats integer paise as Indian rupees, e.g. 149900 → "₹1,499". */
export function formatPrice(pricePaise: number): string {
  if (!isValidPaise(pricePaise)) {
    throw new RangeError(`Invalid price in paise: ${String(pricePaise)}`);
  }
  return inrFormatter.format(pricePaise / PAISE_PER_RUPEE);
}

/** Converts whole rupees to paise, e.g. 499 → 49900. */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isSafeInteger(rupees) || rupees < 0) {
    throw new RangeError(`Invalid whole-rupee amount: ${String(rupees)}`);
  }
  return rupees * PAISE_PER_RUPEE;
}
