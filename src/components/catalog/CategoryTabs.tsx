import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog/categories";
import { catalogHref } from "@/lib/catalog/query";
import type { CatalogQuery } from "@/lib/catalog/types";

/**
 * Category navigation for the catalogue. Switching category keeps the current
 * search, price, stock and sort settings. On phones the tabs wrap rather than
 * scroll, so no category is ever hidden off-screen.
 *
 * Forced colours (Windows High Contrast): inactive tabs drop their transparent
 * underline (which would otherwise be drawn) and the active tab gets a thicker
 * one, so the current category is distinguishable by shape, not colour.
 */
export function CategoryTabs({ query }: { query: CatalogQuery }) {
  const items = [
    { key: null, label: "All" },
    ...CATEGORIES.map((category) => ({ key: category.slug, label: category.shortName })),
  ];

  return (
    <nav aria-label="Product categories" className="border-b border-sand">
      <ul role="list" className="flex flex-wrap gap-x-6 sm:gap-x-10">
        {items.map((item) => {
          const isActive = item.key === query.category;
          return (
            <li key={item.key ?? "all"}>
              <Link
                href={catalogHref({ ...query, category: item.key })}
                aria-current={isActive ? "page" : undefined}
                className={`-mb-px inline-flex min-h-12 min-w-6 items-center justify-center border-b text-sm whitespace-nowrap transition-colors focus-visible:outline-offset-[-3px] sm:text-[13px] sm:tracking-[0.14em] sm:uppercase ${
                  isActive
                    ? "border-ink text-ink forced-colors:border-b-2"
                    : "border-transparent text-muted hover:text-ink forced-colors:border-b-0 forced-colors:pb-px"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
