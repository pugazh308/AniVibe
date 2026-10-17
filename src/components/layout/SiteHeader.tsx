import Link from "next/link";
import { SearchIcon } from "@/components/ui/icons";
import { SEARCH_MAX_LENGTH } from "@/lib/catalog/query";
import { Container } from "./Container";
import { SampleDataNotice } from "./SampleDataNotice";

const navLinkClass =
  "inline-flex min-h-11 items-center text-[13px] tracking-[0.14em] uppercase transition-colors hover:text-wine";

/**
 * Site header (banner landmark): the sample-data notice, then the wordmark and
 * the only controls that work in this phase — Shop and Search. Wishlist,
 * account and cart are deliberately absent until those features exist; a
 * control that does nothing would mislead.
 *
 * The header search starts a fresh search across all products (plain GET
 * form, works without JavaScript). On phones the icon goes to the catalogue's
 * own search field, which keeps the current category and filters.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-sand">
      <SampleDataNotice />
      <Container className="flex h-16 items-center gap-6 sm:h-20">
        <Link href="/" className="font-serif text-[1.75rem] leading-none tracking-[-0.01em] sm:text-[2rem]">
          AniVibe
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-5 sm:gap-8">
          <Link href="/products" className={navLinkClass}>
            Shop
          </Link>

          <form role="search" action="/products#catalog" method="get" className="hidden items-center md:flex">
            <label htmlFor="site-search" className="sr-only">
              Search all products
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search all"
              maxLength={SEARCH_MAX_LENGTH}
              autoComplete="off"
              className="w-40 border-0 border-b border-stone bg-transparent py-1.5 pr-8 pl-0 text-sm placeholder:text-muted focus:border-ink focus-visible:outline-offset-4 lg:w-56"
            />
            <button
              type="submit"
              className="-ml-7 inline-flex size-8 items-center justify-center text-ink hover:text-wine"
            >
              <SearchIcon />
              <span className="sr-only">Search</span>
            </button>
          </form>

          {/* A plain link on purpose: a native fragment navigation (or full load) lets the
              catalogue move focus into its search field (see CatalogFocus). next/link would
              navigate client-side without a hashchange when already on /products. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- intentional, see above */}
          <a
            href="/products#search"
            className="inline-flex size-11 items-center justify-center hover:text-wine md:hidden"
          >
            <SearchIcon />
            <span className="sr-only">Search products</span>
          </a>
        </nav>
      </Container>
    </header>
  );
}
