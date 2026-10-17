> **Redesign (October 2026) — supersedes the "Dark anime theme", "Navigation and active state" and filter-form
> details in the original plan below.** The site was redesigned to a quiet, editorial "Japanese design boutique"
> direction: ivory `#F5F1E9` / ink `#171717` / stone `#77716B` (lines only; small text uses `#66605A` for AA) /
> wine `#783C4A` accent / sand `#D8CFC2` dividers; self-hosted Instrument Serif (OFL 1.1) headings with system sans
> body. The header shows only Shop and Search; the catalogue uses category tabs that keep the current filters, a
> toolbar (search + sort with an explicit Apply — never on change), and a filter panel that is a sidebar from 1024px
> and a native collapsible `<details>` below. The filter form is `noValidate` (the server explains bad input) and
> submissions land on `#catalog`. Products show labelled placeholder illustrations until real photos exist
> (optional `image` field, files under `public/images/`). Catalogue logic, the repository, routes and tests were
> kept; additions are `selectOnePerCategory`, `countPanelFilters`, `clearPanelFilters` and `catalogHref`.
> A second adversarial review (36 confirmed findings, all fixed) drove most of these details.

> **Implementation notes (where the build differed from this plan):**
> - **Vitest 5.0.4 + Vite 8.3.4** instead of Vitest 4.1.11: npm 10.9.4 crashes (`Cannot read properties of null (reading 'edgesOut')`) when installing vitest@4.1.11. Vitest 5 supports Node 22.12+, 24 and 26+, so `engines.node` is `^22.12.0 || ^24.0.0 || >=26.0.0`.
> - **ESLint stays on 9.x** even though npm marks 9.39.5 unsupported: `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y` (bundled by `eslint-config-next` 16.4) only declare support up to ESLint 9.
> - **No commits or pushes yet.** The Git workflow (README-only `main`, then this branch) is waiting for confirmation.
> - Price filter placeholders read "No min" / "No max" (a "0" placeholder looked like an entered value).
> - After an adversarial review (18 confirmed findings, none blocking), these behaviours changed from the plan below:
>   price inputs are `type="text"` sharing the parser's `pattern` (since the redesign, "250.00" is accepted as ₹250
>   and anything else malformed is explained by the server); a min above the max is **swapped** rather than ignored; search tolerates
>   plurals and strips invisible characters; Latin accents only are folded (Indic vowel signs stay significant);
>   search truncation is by grapheme; prices are capped at ₹99,99,999.99; `src/proxy.ts` turns malformed
>   `/products/…` URLs into 404s; `engines.node` is `^22.12.0 || ^24.0.0 || >=26.0.0`.

# AniVibe — Phase 1: Product Catalogue Foundation

## Context

AniVibe is a custom-coded anime-merch store (miniatures, posters, mini stickers, keychains) for budget-conscious fans in India. The milestone is a secure shopping flow, and the first step is **Phase 1: the product catalogue**. That means browsing, search, filters, sorting and product detail pages, with accurate price and stock display, built on clearly labelled sample data. Payments, accounts, orders and the database are out of scope.

## Findings (inspected, read-only)

**What exists:** nothing. `/home/user/AniVibe` holds only `.git`, on the unborn branch `claude/great-mccarthy-3kn2k3` with no commits. The remote `github.com/pugazh308/AniVibe` is empty. There are no files, dependencies, database or services, so there is nothing to overwrite.

**Toolchain:** Node 22.22.0, npm 10.9.4 (pnpm, yarn and bun are present too). The npm registry and Google Fonts are reachable, and `telemetry.nextjs.org` is blocked, which is harmless. Global Playwright 1.56.1 and Chromium are available for browser checks.

**Environment issues:**

1. **npm `latest` is TypeScript 7.0.2 and ESLint 10.** Next 16.4 supports both, but `typescript-eslint` (used by `eslint-config-next`) needs `typescript <6.1`. **Pin TS `^5.9.3` and ESLint `^9.39.5`**, matching the `create-next-app@16.4.0` template.
2. **Next 16 has no `next lint`.** Lint runs with `eslint . --max-warnings=0`, so the jsx-a11y and Core Web Vitals warnings count.
3. **`params` and `searchParams` are Promises in Next 16.** The `PageProps` global only exists after typegen. **Type pages explicitly** and run `typecheck` as `next typegen && tsc --noEmit`.
4. **Vitest does not read tsconfig `paths`**, so an explicit `@/` alias goes in `vitest.config.mts`. **Use `vitest ^4.1.11`**, which bundles Vite. Vitest 5 needs Vite as a separate required peer.
5. **`next/font/google` needs network access at build time.** Use a system font stack instead.
6. **First push to an empty repo.** It becomes the default branch. **Your decision:** push a README-only `main` first, then the feature branch.

Implementation checks Next behaviour against `node_modules/next/dist/docs/` (version-matched), not memory.

## Stack (minimal dependencies)

- **Runtime:** `next@16.4.0`, `react@19.3.0`, `react-dom@19.3.0`
- **Dev:** `typescript@^5.9.3`, `@types/node@^22`, `@types/react@^19`, `@types/react-dom@^19`, `tailwindcss@^4.3.3`, `@tailwindcss/postcss@^4.3.3`, `eslint@^9.39.5`, `eslint-config-next@16.4.0`, `vitest@^4.1.11`
- **Nothing else:** no UI kit, no icon library (inline SVG), no state library, no paid services
- **npm:** commit the lockfile; `"private": true`; `"engines": {"node": ">=20.9.0"}`

Config files (tsconfig, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`) are hand-written to mirror the `create-next-app@16.4.0` `app-tw/ts` template. The one change is the `src/` layout, with `@/* → ./src/*`.

## Architecture: data and logic separate from UI

```
src/
  data/sample-products.ts      # ~16 items, 4 per category; fictional names
  lib/catalog/                 # pure, framework-free, unit-tested
    types.ts       CategorySlug, Category, Product, StockStatus, SortOption, CatalogQuery
    categories.ts  CATEGORIES (4), isCategorySlug(), getCategory()
    money.ts       pricePaise ints; formatPrice() (one cached Intl formatter)
    stock.ts       LOW_STOCK_THRESHOLD=5; getStockStatus(); stockLabel()
    query.ts       parseCatalogQuery(raw) → { query, issues[] }; toSearchParams(query)
    catalog.ts     searchProducts, filterProducts, sortProducts, queryCatalog
    validate.ts    validateProducts() → errors[]
    repository.ts  async getCategories(), findProducts(query), getProductBySlug(), getAllProductSlugs()
  components/
    layout/   SiteHeader (logo + search), CategoryNav ({ active? }), SiteFooter, SampleDataNotice
    catalog/  ProductCard, ProductGrid, CatalogFilters (GET form), EmptyState
    product/  PriceTag, StockBadge, SampleBadge, ProductImagePlaceholder (CSS gradient)
  app/
    layout.tsx  globals.css  page.tsx  not-found.tsx  icon.svg
    products/page.tsx          # dynamic (ƒ): await searchParams → parse → findProducts
    products/[slug]/page.tsx   # SSG (●): generateStaticParams, dynamicParams=false
scripts/smoke.mjs              # HTTP smoke checks, Node built-in fetch, no dependencies
docs/phase-1-plan.md           # copy of this plan, so you can open it in the app
```

### Key decisions

- **Money:**
  - `pricePaise` is a non-negative safe integer.
  - `formatPrice` uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', trailingZeroDisplay: 'stripIfInteger' })`, giving ₹1,499, ₹49.50 and ₹1,00,000.
  - Never use `maximumFractionDigits: 0`, because it rounds ₹1,499.50 to ₹1,500.
  - `formatPrice` throws on invalid input.
  - Prices are formatted only in Server Components.
- **Stock (your decision: always show the exact count):**
  - Status is derived from `stockQuantity` and never stored.
  - 0 shows "Out of stock".
  - 1 to 5 shows "Low stock: N left" in amber, worded neutrally rather than as urgency.
  - Above 5 shows "N in stock".
  - Status is always written as text, never shown by colour alone.
- **Repository is the database seam:**
  - The UI only calls `async` repository functions.
  - `findProducts(query)` uses the pure `queryCatalog` for now and can become a SQL query later without touching pages.
  - It validates the data once and throws on bad data, failing fast at build time.
  - Its doc comment states that future cart and checkout must re-read prices from the repository on the server, by product id, and never trust a price sent by the client.
- **Search, filter and sort live in the URL and run on the server.**
  - `CatalogFilters` is a `<form method="get" action="/products">`. It works without JavaScript, URLs are shareable, and there is no hydration risk.
  - It holds all state: the visible `q`, the category `<select>`, min and max price (`inputMode="numeric"` with min, max and step matching the parser), an `inStock` checkbox with `value="1"`, sort, an Apply button, and a "Clear filters" link.
  - **It is rendered with `key={toSearchParams(query).toString()}`.** Otherwise, after a client navigation via a category pill, React keeps the old `<select>` `defaultValue` and the next Apply sends a stale category.
  - The header search and the category pills start a fresh query on purpose. This is documented.
- **`parseCatalogQuery` (untrusted input):**
  - For every param: take the first value if it is an array, trim it, and **treat `''` as absent with no issue**. An empty form submission therefore gives no warnings.
  - `q`: collapse whitespace, NFKC-normalise, and cap at 100 code points (`Array.from`).
  - `category`: must be one of the four slugs, otherwise ignored with an issue.
  - `min` and `max`: whole rupees, **ASCII digits only**, matching `^[0-9]{1,7}$`. Leading zeros are allowed, so `0500` becomes 500. `+500`, `-5`, `12.5`, `1e3`, full-width `５００`, Devanagari `५००` and 8+ digits are each ignored with an issue. If `min > max`, both are ignored with an issue; `min == max` is valid.
  - `inStock`: only `'1'` counts as true. `on`, `true`, `0` and other values count as false.
  - `sort`: an unknown value falls back to `featured`.
  - Issue messages never echo the raw input.
  - The issues notice sits next to the form, and bad input never causes a 500.
- **Filter semantics:**
  - Price bounds are inclusive and compared in paise.
  - Search matches every NFKC, case-folded token as a substring of the product **name** only.
  - Filters combine with AND.
- **Sorting:**
  - Options are `featured` (data order), price ascending, price descending, and name A–Z.
  - Names are compared with `Intl.Collator('en-IN', { sensitivity: 'base', numeric: true })`.
  - Sorts are stable (ties broken by name, then id) and never mutate their input.
- **Sample data honesty:**
  - Every id has a `SAMPLE-` prefix, and every product has `isSample: true`.
  - Names are fictional with no "Sample" prefix, so name sorting stays meaningful.
  - There are no franchise names, logos, art, or licensing, authenticity, discount or shipping claims.
  - The site-wide banner says products, **prices and stock levels are sample values and nothing can be ordered yet**. The detail page repeats this next to the price and stock, and every card has a "Sample" badge.
  - `robots: { index: false }` is set while the data is sample.
  - The home page has a hero, the four category tiles and a "Browse all" link. There are no "featured", "trending" or "bestseller" sections.
- **Navigation and active state:**
  - Layouts can't read search params, so `CategoryNav` (All plus the four categories, as a horizontally scrollable pill row) is rendered by each page with an `active` prop.
  - The active pill gets `aria-current="page"`. On the detail page, the active pill is the product's category.
  - `/products` gets a `generateMetadata` title that reflects the category and search.
- **Dark anime theme:**
  - Colours are Tailwind v4 `@theme` tokens: near-black background, neon magenta and violet accents, and a cyan highlight. All text pairs meet AA contrast.
  - `:root { color-scheme: dark }`, plus `export const viewport = { colorScheme: 'dark', themeColor }` (not in `metadata`).
  - A skip link, visible `focus-visible` rings, landmarks, and `lang="en-IN"`.
  - Every control has a `<label>`, and product lists use `role="list"`.
  - `min-w-0` on flex children to prevent overflow at 320px.
  - Full Tailwind class names only, with no dynamic `bg-${x}`.

## Scripts

- `dev`, `build`, `start`
- `lint`: `eslint . --max-warnings=0`
- `typecheck`: `next typegen && tsc --noEmit`
- `test`: `vitest run`
- `smoke`: `node scripts/smoke.mjs`, run against a running server
- `check`: typecheck, then lint, then test

## Verification

1. **Unit tests (`npm test`):**
   - The parser: the empty-form submission gives no issues; `' 500 '`, `0500`, `0`, `9999999`, `+500`, full-width and Devanagari digits, 8 digits, `abc`, `-5`, `12.5`, `1e3`; array params including `['', 'posters']`; `min > max`; `min == max`; `inStock` set to `1`, `on`, `true` or `0`; unknown category and sort; long `q` and emoji; a `toSearchParams` round trip.
   - Filters: inclusive bounds with paise (₹49.50 is excluded by `max=49` and included by `max=50`), and AND combinations.
   - Search normalisation and the no-match case.
   - Sort order, stability, and no mutation.
   - `formatPrice`: ₹49, ₹49.50, ₹1,499, ₹1,00,000, and throwing on bad input.
   - Stock boundaries at 0, 1, 5 and 6.
   - `validateProducts` catches duplicate ids and slugs, bad slugs, unknown categories, empty names, negative or non-integer stock, and non-integer price.
   - **Sample data covers the edge cases:** every category, at least one product out of stock, at least one at 1 to 5 units, at least one price with paise, and all products sample-marked.
2. **Static checks:** run `npm run typecheck`, `npm run lint` and `npm run build`.
   - The build route table should show `/` as ○ (static), `/products` as ƒ (dynamic) and `/products/[slug]` as ● (SSG, every slug).
   - `git status` should be clean after the build, which catches Next rewriting `tsconfig`.
3. **`npm start` plus `npm run smoke`:**
   - Every route returns 200, and the five nav links return 200.
   - An unknown slug returns **404**.
   - The empty-form URL shows no issue notice.
   - Bad input returns 200 with the notice.
   - Category alone, and category plus `q`, return the right intersection.
   - A price range returns only in-range items.
   - `inStock=1` returns no "Out of stock" items.
   - `price-asc` and `price-desc` come back in order, checked through `data-price` and `data-slug` on the cards.
   - `q=zzzz` shows the empty state.
   - **Every slug's detail page shows the same price and stock label as its card.**
4. **Playwright (global install, scratchpad script):**
   - Screenshots at 320, 390 and 1280 px, with no horizontal overflow.
   - The stale-select regression check: choose a category in the form, click a different pill, and assert the select's value.
   - With JavaScript disabled, submitting the form filters correctly.
   - The first Tab press shows and focuses the skip link.
   - Every control is reachable with `getByLabel`.
   - Computed contrast ratios for the theme colour pairs.
5. **Hygiene:**
   - `npm ls --depth=0` lists only the allowed packages.
   - `git ls-files` contains no `.env*`, `.next` or `next-env.d.ts`.
   - A secrets grep finds nothing.
   - A claims grep finds none of: official, licensed, authentic, genuine, free shipping, COD, % off, sale, bestseller, trending.
   - The lockfile includes the native packages for other platforms (`@next/swc-*`, `lightningcss-*`, `@tailwindcss/oxide-*`).
6. **Adversarial review workflow (at most 10 agents):**
   - Four lenses: catalogue logic and validation, Next 16 correctness, accessibility and responsive layout, and requirement compliance.
   - Each finding is checked by a skeptic.
   - Fix the confirmed findings, then re-run steps 1 to 5.
7. **Git:**
   - Point the unborn HEAD at `main`, commit a README-only base, and run `git push -u origin main`.
   - Run `git checkout -b claude/great-mccarthy-3kn2k3`, commit Phase 1, and run `git push -u origin claude/great-mccarthy-3kn2k3`.
   - No PR is opened unless you ask.

## Out of scope (Phase 1)

Cart, checkout, payments (UPI and cards), accounts, orders, the database, admin and inventory editing, real images, category SEO routes, related products, and internationalisation and multi-currency.
