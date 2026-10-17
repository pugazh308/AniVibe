# AniVibe

Storefront for AniVibe, an anime merchandise shop (miniatures, posters, mini stickers and keychains) for fans in India.

**Status: Phase 1 — product catalogue only.** Everything shown uses clearly labelled **sample data** — products,
prices and stock levels are placeholders, and nothing can be ordered. There is no cart, checkout, payment, account
or order handling yet.

## What works in Phase 1

- Responsive storefront: announcement strip with the sample-data notice, wordmark header (Shop + Search), editorial
  home page (hero, the four categories, one product from each category, brand introduction), minimal footer
- Four categories: Anime Miniatures, Posters, Mini Stickers, Keychains
- Product listing cards and product detail pages
- Search by product name (case- and accent-insensitive, tolerant of plurals like "posters"; every word must match)
- Category tabs that keep the current search, filters and sort
- Filters: price range (whole rupees, inclusive; "250.00" counts as ₹250; a min above the max is swapped) and
  in stock only — a sidebar from 1024px, a collapsible panel on smaller screens
- Sorting (applied with an explicit Apply, never on arrow keys): catalogue order, price low→high, price high→low,
  name A→Z
- Prices in INR from integer paise (e.g. ₹49.50, ₹1,499, ₹1,00,000); exact stock counts
  (`12 in stock`, `Low stock: 3 left`, `Out of stock`)
- Search/filter/sort live in the URL, run on the server and work without JavaScript

Wishlist, account and cart controls are intentionally absent until those features exist.

## Design

Quiet, editorial "Japanese design boutique" direction: warm ivory ground, ink type, muted stone, a restrained deep
wine accent and soft sand dividers (tokens in `src/app/globals.css`). Headings use **Instrument Serif**; body copy,
prices and controls use the system sans-serif.

`#77716B` stone is 4.28:1 on ivory — below WCAG AA for small text — so small secondary text uses a deeper
`#66605A` (5.5:1); stone is kept for lines and icons.

### Product images

There are no product photos yet. Each product shows a category placeholder illustration (line-drawn object study),
labelled "Sample · placeholder" and described to screen readers as "not a product photo".

To add a real photo, put the file under `public/images/` and set `image` on the product:

```ts
image: { src: "/images/products/crimson-ronin.jpg", alt: "Red-armoured swordsman figure on a round base" }
```

Validation only accepts `.jpg`/`.png`/`.webp`/`.avif` files under `/images/` — not `/products/…` (that path is the
product pages), and not remote URLs (those would first need `images.remotePatterns` in `next.config.ts`).

### Fonts and licences

Instrument Serif is self-hosted from `src/app/fonts/` (no external font requests at build or run time). It is
© 2022 The Instrument Serif Project Authors and licensed under the SIL Open Font License 1.1 — the licence text is in
`src/app/fonts/OFL.txt` and must stay with the font files.

## Requirements

- Node.js **22 (22.12+), 24, or 26+** — the versions Vitest 5 supports (odd-numbered 23 and 25 are not)
- npm (a `package-lock.json` is included)

## Run it locally

```bash
npm install
npm run dev          # development server with hot reload
```

Then open <http://localhost:3000>.

To run the production build instead:

```bash
npm run build
npm start            # serves the built site on http://localhost:3000
```

## Checks

```bash
npm run check        # typecheck + lint (zero warnings allowed) + unit tests
npm test             # unit tests only (Vitest)

# HTTP smoke tests — needs the production server running in another terminal:
npm run build && npm start
npm run smoke        # set BASE_URL to test another address
```

## Project structure

```
src/
  data/sample-products.ts   Sample catalogue (replace with real inventory)
  lib/catalog/              Pure catalogue logic, no UI:
    types.ts                  Product, Category, CatalogQuery types
    categories.ts             The four categories
    money.ts                  Paise ↔ rupees, INR formatting
    stock.ts                  Stock status + labels (low-stock threshold = 5)
    query.ts                  Validates URL search params → CatalogQuery
    catalog.ts                Search, filter, sort
    validate.ts               Runtime validation of product records
    repository.ts             Data-access layer — the only place pages get products from
  components/               Reusable typed UI components
    layout/                   Header, footer, announcement strip, page container
    catalog/                  Product card/grid, category tabs, filter panel, sort, empty state
    product/                  Price, stock label, product image + placeholder illustrations
    home/                     Hero illustration
    ui/                       Thin-stroke icons
  app/                      Next.js App Router pages, global styles, self-hosted fonts
  proxy.ts                  Turns malformed /products/… URLs into 404s instead of server errors
scripts/smoke.mjs           HTTP smoke tests
docs/phase-1-plan.md        Phase 1 plan and decisions
```

## Editing products

Until a database exists, edit `src/data/sample-products.ts`. Prices are in **paise** (`pricePaise: 49900` = ₹499).
The data is validated at build time (unique ids/slugs, integer prices and stock, known categories); `npm test` and
`npm run build` fail on invalid data.

When moving to a database, replace the function bodies in `src/lib/catalog/repository.ts` and keep their signatures.
Product detail pages are prebuilt at build time, so at that point they must also switch to on-demand rendering or
revalidation — otherwise they would show the price and stock from the last build. Future checkout code must re-read
prices on the server through the repository and never trust a price sent by the browser.

## Known limitations

- ESLint is pinned to v9, which npm reports as no longer supported: the lint plugins bundled with
  `eslint-config-next` 16.4 do not yet declare support for ESLint 10. Lint is a development tool only.
- Product pages are prebuilt; with `dynamicParams = false`, a product added after a build returns 404 until the
  next build. Revisit when products come from a database.
- No real product photos yet — labelled placeholder illustrations are shown.
- A product URL with broken percent-encoding (e.g. a cut-off link ending in `%`) gets a minimal standalone 404 page
  rather than the full branded one, because Next.js cannot decode such URLs.
- The always-open desktop filter sidebar relies on CSS `::details-content` (current Chrome, Edge, Safari and
  Firefox). Older browsers show the same collapsible "Filter" panel as phones — still fully usable.
- The phone header's search icon opens the catalogue search; from a filtered catalogue page it starts a fresh search.
