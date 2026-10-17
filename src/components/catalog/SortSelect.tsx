import { SORT_OPTIONS, type SortOption } from "@/lib/catalog/types";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Catalogue order",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A to Z",
};

interface SortSelectProps {
  value: SortOption;
  /** id of the catalogue form this control submits with. */
  formId: string;
}

/**
 * Compact sort control with an explicit Apply button. It deliberately does
 * not submit on change: with a keyboard, every arrow-key press would reload
 * the page and lose focus (WCAG 3.2.2 On Input).
 */
export function SortSelect({ value, formId }: SortSelectProps) {
  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
      <label htmlFor="filter-sort" className="eyebrow pb-3">
        Sort
      </label>
      <select
        id="filter-sort"
        name="sort"
        form={formId}
        defaultValue={value}
        autoComplete="off"
        className="min-h-11 cursor-pointer border-0 border-b border-stone bg-transparent py-1 pr-7 pl-0 text-sm text-ink"
      >
        {SORT_OPTIONS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </select>
      <button type="submit" form={formId} className="link-quiet mb-2 text-sm">
        Apply<span className="sr-only"> sort</span>
      </button>
    </div>
  );
}
