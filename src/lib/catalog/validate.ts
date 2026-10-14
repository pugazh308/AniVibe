/**
 * Runtime validation of product records. Types alone are not enough once
 * products come from a database, CSV import or admin form, so the repository
 * runs this at its boundary and refuses to serve invalid data.
 */

import { isCategorySlug } from "./categories";
import { MAX_PRICE_PAISE, isValidPaise } from "./money";
import type { Product } from "./types";

export const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Product photos live under public/images/ — see ProductPhoto in types.ts. */
const PRODUCT_IMAGE_SRC_PATTERN = /^\/images\/[A-Za-z0-9._\-/]+\.(?:jpe?g|png|webp|avif)$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Non-empty with no stray leading/trailing whitespace (which would skew sorting and lookups). */
function isCleanString(value: unknown): value is string {
  return isNonEmptyString(value) && value === value.trim();
}

/** Returns a list of problems; an empty list means the data is valid. */
export function validateProducts(products: readonly Product[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  products.forEach((product, index) => {
    const label = isNonEmptyString(product.id) ? product.id : `product #${index}`;

    if (!isCleanString(product.id)) {
      errors.push(`${label}: id must be a non-empty string without leading/trailing spaces`);
    } else if (seenIds.has(product.id)) {
      errors.push(`${label}: duplicate id`);
    } else {
      seenIds.add(product.id);
    }

    if (typeof product.slug !== "string" || !PRODUCT_SLUG_PATTERN.test(product.slug)) {
      errors.push(`${label}: slug must be lowercase letters, digits and single hyphens`);
    } else if (seenSlugs.has(product.slug)) {
      errors.push(`${label}: duplicate slug "${product.slug}"`);
    } else {
      seenSlugs.add(product.slug);
    }

    if (!isCleanString(product.name)) {
      errors.push(`${label}: name must be a non-empty string without leading/trailing spaces`);
    }

    if (typeof product.category !== "string" || !isCategorySlug(product.category)) {
      errors.push(`${label}: unknown category`);
    }

    if (!isValidPaise(product.pricePaise) || product.pricePaise <= 0) {
      errors.push(`${label}: pricePaise must be a positive integer up to ${MAX_PRICE_PAISE}`);
    }

    if (!Number.isSafeInteger(product.stockQuantity) || product.stockQuantity < 0) {
      errors.push(`${label}: stockQuantity must be a non-negative integer`);
    }

    if (!isNonEmptyString(product.description)) {
      errors.push(`${label}: description must be a non-empty string`);
    }

    if (
      !Array.isArray(product.specs) ||
      !product.specs.every((spec) => isNonEmptyString(spec?.label) && isNonEmptyString(spec?.value))
    ) {
      errors.push(`${label}: specs must be a list of non-empty label/value pairs`);
    }

    if (
      product.image !== undefined &&
      !(
        isCleanString(product.image?.src) &&
        PRODUCT_IMAGE_SRC_PATTERN.test(product.image.src) &&
        isCleanString(product.image.alt)
      )
    ) {
      errors.push(`${label}: image needs a src under /images/ (e.g. /images/products/x.jpg) and non-empty alt text`);
    }

    if (typeof product.isSample !== "boolean") {
      errors.push(`${label}: isSample must be a boolean`);
    }
  });

  return errors;
}

/** Throws with every problem listed if any product is invalid. */
export function assertValidProducts(products: readonly Product[]): void {
  const errors = validateProducts(products);
  if (errors.length > 0) {
    throw new Error(`Invalid product data:\n- ${errors.join("\n- ")}`);
  }
}
