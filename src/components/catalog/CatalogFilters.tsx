import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";
import {
  MAX_PRICE_DIGITS,
  WHOLE_RUPEES_INPUT_PATTERN,
  catalogHref,
  clearPanelFilters,
  countPanelFilters,
} from "@/lib/catalog/query";
import type { CatalogQuery } from "@/lib/catalog/types";

export const CATALOG_FORM_ID = "catalog-form";

/** Submissions land on the catalogue heading: controls stay in view on desktop, products on phones. */
export const CATALOG_ANCHOR = "catalog";

const priceInputProps = {
  type: "text",
  inputMode: "numeric",
  // The same rule as the server parser. The form is `noValidate`, so this only
  // flags a malformed value (wine underline) — it never silently blocks a
  // submission (e.g. while the panel is collapsed); the server explains instead.
  pattern: WHOLE_RUPEES_INPUT_PATTERN,
  maxLength: MAX_PRICE_DIGITS + 3,
  title: "Whole rupees, digits only (for example 499)",
  autoComplete: "off",
  className:
    "mt-1 w-full min-w-0 border-0 border-b border-stone bg-transparent px-0 py-2 text-sm text-ink placeholder:text-muted user-invalid:border-wine",
} as const;

interface CatalogFiltersProps {
  query: CatalogQuery;
  /** id of an element describing problems with the current query, if any. */
  describedBy?: string;
}

/**
 * The catalogue form: a plain GET form, so filtering works without
 * JavaScript and every result URL is shareable. The search box and sort
 * control live in the toolbar and join this form via their `form` attribute.
 *
 * The panel is a native <details> disclosure on small screens and an
 * always-open sidebar from 1024px (see .filter-panel in globals.css).
 *
 * Render with `key={toSearchParams(query).toString()}` — uncontrolled inputs
 * keep their old `defaultValue` across client navigations otherwise.
 */
export function CatalogFilters({ query, describedBy }: CatalogFiltersProps) {
  const activeCount = countPanelFilters(query);

  return (
    <form
      id={CATALOG_FORM_ID}
      action={`/products#${CATALOG_ANCHOR}`}
      method="get"
      noValidate
      autoComplete="off"
      aria-label="Filter products"
      aria-describedby={describedBy}
    >
      {query.category !== null && <input type="hidden" name="category" value={query.category} />}
      <details className="filter-panel border-y border-sand lg:border-0">
        <summary className="flex min-h-12 items-center justify-between gap-4 text-[13px] tracking-[0.14em] uppercase">
          <span>
            Filter
            {activeCount > 0 && <span className="text-muted"> · {activeCount} active</span>}
          </span>
          <PlusIcon className="filter-panel-icon size-4 transition-transform" />
        </summary>

        <div className="space-y-9 pt-2 pb-8 lg:pt-1 lg:pb-0">
          <fieldset>
            <legend className="eyebrow">Price (₹)</legend>
            <div className="mt-2 grid grid-cols-2 gap-5">
              <div className="min-w-0">
                <label htmlFor="filter-min" className="text-xs text-muted">
                  Min
                </label>
                <input
                  id="filter-min"
                  name="min"
                  {...priceInputProps}
                  defaultValue={query.minPriceRupees ?? ""}
                  placeholder="No min"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="filter-max" className="text-xs text-muted">
                  Max
                </label>
                <input
                  id="filter-max"
                  name="max"
                  {...priceInputProps}
                  defaultValue={query.maxPriceRupees ?? ""}
                  placeholder="No max"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow">Availability</legend>
            <div className="mt-3 flex min-h-6 items-center gap-3">
              <input
                id="filter-in-stock"
                name="inStock"
                type="checkbox"
                value="1"
                defaultChecked={query.inStockOnly}
                className="size-4 accent-ink"
              />
              <label htmlFor="filter-in-stock" className="text-sm">
                In stock only
              </label>
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="submit" className="btn-ink">
              Apply
            </button>
            {activeCount > 0 && (
              <Link href={catalogHref(clearPanelFilters(query))} className="link-quiet text-sm">
                Clear filters
              </Link>
            )}
          </div>
        </div>
      </details>
    </form>
  );
}
