// HTTP smoke tests against a running AniVibe server (no dependencies).
//
//   npm run build && npm start      # in one terminal
//   npm run smoke                   # in another (BASE_URL defaults to http://localhost:3000)
//
// Expected results are computed here directly from the sample data with plain
// JavaScript — deliberately NOT by reusing the app's catalogue functions — so
// a bug in the app's logic cannot also hide itself in the oracle.

import { SAMPLE_PRODUCTS } from "../src/data/sample-products.ts";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const CATEGORY_SLUGS = ["miniatures", "posters", "stickers", "keychains"];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  trailingZeroDisplay: "stripIfInteger",
});
const expectedPrice = (paise) => inr.format(paise / 100);
const expectedStock = (qty) =>
  qty === 0 ? "Out of stock" : qty <= 5 ? `Low stock: ${qty} left` : `${qty} in stock`;
const collator = new Intl.Collator("en-IN", { sensitivity: "base", numeric: true });

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function get(path) {
  const response = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  return { status: response.status, headers: response.headers, html: await response.text() };
}

/** Product cards in page order: [{ slug, pricePaise, stock, html }]. */
function cards(html) {
  return html
    .split("<article")
    .slice(1)
    .map((chunk) => {
      const slug = /data-slug="([^"]+)"/.exec(chunk)?.[1];
      const price = /data-price-paise="(\d+)"/.exec(chunk)?.[1];
      const stock = /data-stock="(\d+)"/.exec(chunk)?.[1];
      return slug ? { slug, pricePaise: Number(price), stock: Number(stock), html: chunk.split("</article>")[0] } : null;
    })
    .filter(Boolean);
}

const slugsOf = (products) => products.map((p) => p.slug);
const sameList = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hasIssueNotice = (html) => html.includes('role="status"');

async function expectListing(name, path, expectedProducts, { issues = false } = {}) {
  const { status, html } = await get(path);
  check(`${name}: status 200`, status === 200, `got ${status}`);
  const actual = cards(html).map((c) => c.slug);
  check(`${name}: products`, sameList(actual, slugsOf(expectedProducts)), `expected ${slugsOf(expectedProducts).join(",")} got ${actual.join(",")}`);
  check(`${name}: issue notice ${issues ? "shown" : "absent"}`, hasIssueNotice(html) === issues);
  return html;
}

async function main() {
  // ── Home ────────────────────────────────────────────────────────────────
  {
    const { status, headers, html } = await get("/");
    check("home: status 200", status === 200, `got ${status}`);
    check("home: sample-data banner", html.includes("Nothing can be ordered yet"));
    for (const slug of CATEGORY_SLUGS) {
      check(`home: link to ${slug}`, html.includes(`href="/products?category=${slug}"`));
    }
    check("home: no x-powered-by header", !headers.has("x-powered-by"));
    check("home: noindex while sample data", /<meta name="robots" content="noindex, nofollow"/.test(html));
    check("home: self-hosted heading font is preloaded", /<link[^>]+rel="preload"[^>]+\.woff2/.test(html));

    // One product from each category, in category order, preferring in-stock items.
    const expectedSelection = CATEGORY_SLUGS.map((slug) => {
      const inCategory = SAMPLE_PRODUCTS.filter((p) => p.category === slug);
      return inCategory.find((p) => p.stockQuantity > 0) ?? inCategory[0];
    });
    const homeCards = cards(html).map((c) => c.slug);
    check("home: selection is one product per category", sameList(homeCards, slugsOf(expectedSelection)), homeCards.join(","));
    check("home: no wishlist/account/cart controls", !/wishlist|my account|add to cart|\bcart\b/i.test(html));
  }

  // ── Full catalogue and category navigation ──────────────────────────────
  await expectListing("all products", "/products", SAMPLE_PRODUCTS);
  for (const slug of CATEGORY_SLUGS) {
    const html = await expectListing(
      `category ${slug}`,
      `/products?category=${slug}`,
      SAMPLE_PRODUCTS.filter((p) => p.category === slug),
    );
    check(`category ${slug}: active pill`, new RegExp(`href="/products\\?category=${slug}"[^>]*aria-current="page"|aria-current="page"[^>]*href="/products\\?category=${slug}"`).test(html));
  }

  // ── Empty GET-form submission must not warn ─────────────────────────────
  await expectListing("empty form submission", "/products?q=&category=&min=&max=&sort=featured", SAMPLE_PRODUCTS);

  // ── Invalid input: 200 + notice, never a server error ───────────────────
  await expectListing("invalid min", "/products?min=abc", SAMPLE_PRODUCTS, { issues: true });
  await expectListing(
    "min > max is swapped",
    "/products?min=500&max=100",
    SAMPLE_PRODUCTS.filter((p) => p.pricePaise >= 10000 && p.pricePaise <= 50000),
    { issues: true },
  );
  await expectListing("unknown category", "/products?category=figures", SAMPLE_PRODUCTS, { issues: true });
  await expectListing("unknown sort", "/products?sort=cheapest", SAMPLE_PRODUCTS, { issues: true });
  {
    const { status, html } = await get(`/products?q=${encodeURIComponent("<script>alert(1)</script>")}`);
    check("script in search: status 200", status === 200, `got ${status}`);
    check("script in search: escaped", !html.includes("<script>alert(1)</script>"));
  }

  // ── Filters ─────────────────────────────────────────────────────────────
  await expectListing(
    "price range ₹100–₹200 (inclusive)",
    "/products?min=100&max=200",
    SAMPLE_PRODUCTS.filter((p) => p.pricePaise >= 10000 && p.pricePaise <= 20000),
  );
  await expectListing(
    "max ₹49 excludes ₹49.50",
    "/products?max=49",
    SAMPLE_PRODUCTS.filter((p) => p.pricePaise <= 4900),
  );
  {
    const html = await expectListing(
      "in stock only",
      "/products?inStock=1",
      SAMPLE_PRODUCTS.filter((p) => p.stockQuantity > 0),
    );
    check("in stock only: no out-of-stock label", !html.includes("Out of stock"));
  }
  {
    // Category tabs keep the current search, filters and sort.
    const { html } = await get("/products?q=poster&max=300&inStock=1&sort=price-desc");
    check(
      "category tabs preserve filters",
      html.includes('href="/products?q=poster&amp;category=posters&amp;max=300&amp;inStock=1&amp;sort=price-desc"'),
    );
    check("filter panel shows active count", /·\s*(?:<!-- -->)?\s*2\s*(?:<!-- -->)?\s*active/.test(html));
  }
  await expectListing(
    "category + search intersection",
    "/products?category=posters&q=a4",
    SAMPLE_PRODUCTS.filter((p) => p.category === "posters" && p.name.toLowerCase().includes("a4")),
  );
  await expectListing(
    "case-insensitive search",
    "/products?q=FOX",
    SAMPLE_PRODUCTS.filter((p) => p.name.toLowerCase().includes("fox")),
  );
  await expectListing(
    "plural search finds singular names",
    "/products?q=keychains",
    SAMPLE_PRODUCTS.filter((p) => p.name.toLowerCase().includes("keychain")),
  );
  {
    const html = await expectListing("no-match search", "/products?q=zzzz", []);
    check("no-match search: empty state", html.includes("No products match"));
  }

  // ── Sorting ─────────────────────────────────────────────────────────────
  const byName = (a, b) => collator.compare(a.name, b.name) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  await expectListing(
    "sort price low→high",
    "/products?sort=price-asc",
    [...SAMPLE_PRODUCTS].sort((a, b) => a.pricePaise - b.pricePaise || byName(a, b)),
  );
  await expectListing(
    "sort price high→low",
    "/products?sort=price-desc",
    [...SAMPLE_PRODUCTS].sort((a, b) => b.pricePaise - a.pricePaise || byName(a, b)),
  );
  await expectListing("sort name A→Z", "/products?sort=name-asc", [...SAMPLE_PRODUCTS].sort(byName));

  // ── Cards and detail pages show accurate, consistent price and stock ────
  const listing = cards((await get("/products")).html);
  for (const product of SAMPLE_PRODUCTS) {
    const price = expectedPrice(product.pricePaise);
    const stock = expectedStock(product.stockQuantity);

    const card = listing.find((c) => c.slug === product.slug);
    check(`card ${product.slug}: price ${price}`, card?.html.includes(price) === true);
    check(`card ${product.slug}: stock "${stock}"`, card?.html.includes(stock) === true);

    const { status, html } = await get(`/products/${product.slug}`);
    check(`detail ${product.slug}: status 200`, status === 200, `got ${status}`);
    check(`detail ${product.slug}: name`, html.includes(product.name));
    check(`detail ${product.slug}: price ${price}`, html.includes(price));
    check(`detail ${product.slug}: stock "${stock}"`, html.includes(stock));
    check(`detail ${product.slug}: sample notice`, html.includes("Ordering isn’t available yet"));
    check(`detail ${product.slug}: title marks sample`, html.includes(`<title>${product.name} (sample) | AniVibe</title>`));
    check(
      `detail ${product.slug}: exactly one aria-current="page" (the breadcrumb)`,
      (html.match(/aria-current="page"/g) ?? []).length === 1,
    );
  }

  // ── Unknown or malformed product URLs are a branded 404, never a 500 ─────
  for (const path of [
    "/products/does-not-exist",
    "/products/CRIMSON-RONIN-MINI-FIGURE",
    "/nope",
    "/products/%ZZ",
    "/products/crimson%",
    "/products/%5Bslug%5D",
  ]) {
    const { status, html } = await get(path);
    check(`404 for ${path}`, status === 404, `got ${status}`);
    check(`404 page for ${path} is branded and titled`, html.includes("<title>Page not found | AniVibe</title>"));
  }

  console.log(`\n${passed} passed, ${failures.length} failed (against ${BASE_URL})`);
  if (failures.length > 0) {
    for (const failure of failures) console.log(`  ✗ ${failure}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Smoke test could not run: ${error.message}`);
  console.error(`Is the server running at ${BASE_URL}? Try: npm run build && npm start`);
  process.exitCode = 1;
});
