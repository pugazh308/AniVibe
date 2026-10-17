import type { Metadata } from "next";
import { CATALOG_ANCHOR, CATALOG_FORM_ID, CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogFocus } from "@/components/catalog/CatalogFocus";
import { CatalogFormRestore } from "@/components/catalog/CatalogFormRestore";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SortSelect } from "@/components/catalog/SortSelect";
import { Container } from "@/components/layout/Container";
import { SearchIcon } from "@/components/ui/icons";
import { getCategory } from "@/lib/catalog/categories";
import {
  SEARCH_MAX_LENGTH,
  hasActiveFilters,
  parseCatalogQuery,
  toSearchParams,
  type RawSearchParams,
} from "@/lib/catalog/query";
import { findProducts } from "@/lib/catalog/repository";
import type { CatalogQuery } from "@/lib/catalog/types";

// Typed explicitly (rather than with the generated PageProps helper) so a
// standalone `tsc --noEmit` works without running Next's type generation first.
interface ProductsPageProps {
  searchParams: Promise<RawSearchParams>;
}

const ISSUES_ID = "filter-issues";

function headingFor(query: CatalogQuery): string {
  return query.category === null ? "All products" : getCategory(query.category).name;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { query } = parseCatalogQuery(await searchParams);
  const heading = headingFor(query);
  return { title: query.q === "" ? heading : `Search: ${query.q} — ${heading}` };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { query, issues } = parseCatalogQuery(await searchParams);
  const products = await findProducts(query);
  const count = products.length;
  // Keyed by the full query so uncontrolled inputs reset after client-side navigation.
  const formKey = toSearchParams(query).toString();

  return (
    <Container className="pt-10 pb-24 sm:pt-14">
      <CatalogFormRestore formId={CATALOG_FORM_ID} />
      <CatalogFocus navKey={formKey} searchId="search" fallbackId={CATALOG_ANCHOR} />
      {/* Search, sort and filter submissions land here (see CATALOG_ANCHOR); it also receives
          focus when a client-side update would otherwise drop focus to the page body. */}
      <div id={CATALOG_ANCHOR} tabIndex={-1} className="scroll-mt-4 outline-none focus-visible:outline-2">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.01em] text-balance sm:text-6xl">
          {headingFor(query)}
        </h1>
      </div>

      <div className="mt-8 sm:mt-10">
        <CategoryTabs query={query} />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-5 lg:mt-10 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        {/* Toolbar: search and sort join the catalogue form via the `form` attribute. */}
        <div
          key={`toolbar-${formKey}`}
          className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:col-start-2 lg:row-start-1"
        >
          <div className="flex w-full max-w-sm items-end">
            <label htmlFor="search" className="sr-only">
              Search products by name
            </label>
            <input
              id="search"
              name="q"
              type="search"
              form={CATALOG_FORM_ID}
              defaultValue={query.q}
              maxLength={SEARCH_MAX_LENGTH}
              autoComplete="off"
              placeholder="Search by name"
              className="min-h-11 w-full min-w-0 scroll-mt-6 border-0 border-b border-stone bg-transparent py-2 pr-10 pl-0 text-sm text-ink placeholder:text-muted"
            />
            <button
              type="submit"
              form={CATALOG_FORM_ID}
              className="-ml-10 inline-flex size-11 shrink-0 items-center justify-center hover:text-wine"
            >
              <SearchIcon />
              <span className="sr-only">Search</span>
            </button>
          </div>
          <SortSelect value={query.sort} formId={CATALOG_FORM_ID} />
        </div>

        <aside aria-label="Filters" className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-8">
            <CatalogFilters key={formKey} query={query} describedBy={issues.length > 0 ? ISSUES_ID : undefined} />
          </div>
        </aside>

        <section aria-labelledby="results-heading" className="min-w-0 lg:col-start-2 lg:row-start-2">
          <h2 id="results-heading" className="sr-only">
            Results
          </h2>
          {issues.length > 0 && (
            <div id={ISSUES_ID} role="status" className="mb-6 border-l-2 border-wine bg-paper px-4 py-3 text-sm text-ink">
              <p className="font-medium">Some filters were adjusted:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Polite live region: client-side changes (tabs, Clear filters) announce the new count. */}
          <p
            aria-live="polite"
            aria-atomic="true"
            className="mb-8 text-sm [overflow-wrap:anywhere] text-muted"
            data-testid="result-count"
          >
            {count} {count === 1 ? "product" : "products"}
            {query.q !== "" && <> matching “{query.q}”</>}
          </p>
          {count > 0 ? <ProductGrid products={products} /> : <EmptyState canClear={hasActiveFilters(query)} />}
        </section>
      </div>
    </Container>
  );
}
