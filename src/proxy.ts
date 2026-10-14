import { NextResponse, type NextRequest } from "next/server";
import { PRODUCT_SLUG_PATTERN } from "@/lib/catalog/validate";

// Minimal standalone page for URLs Next.js cannot even decode (see below).
// It can't use the app's stylesheet, so it inlines the brand palette.
const BROKEN_LINK_HTML = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light">
<title>Page not found | AniVibe</title>
</head>
<body style="margin:0;background:#f5f1e9;color:#171717;font-family:ui-sans-serif,system-ui,sans-serif;text-align:center;padding:6rem 1.25rem">
<p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#66605a">404</p>
<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:3rem;line-height:1;margin:1.25rem 0">Page not found</h1>
<p style="color:#66605a">That link looks broken or incomplete.</p>
<p style="margin-top:2.5rem"><a href="/products" style="display:inline-block;background:#171717;color:#f5f1e9;padding:.9rem 1.75rem;font-size:13px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none">Browse all products</a></p>
</body>
</html>`;

function isDecodable(segment: string): boolean {
  try {
    decodeURIComponent(segment);
    return true;
  } catch {
    return false;
  }
}

/**
 * Guards /products/[slug] against URLs that can never be a product, which
 * Next.js would otherwise answer with a bare-text 500:
 * - Broken percent-encoding (e.g. a cut-off shared link "/products/crimson%"):
 *   Next.js fails to decode the param even after a rewrite, so answer 404 here.
 * - Anything else that isn't a valid slug (e.g. a literal "/products/[slug]"):
 *   rewrite to a slug that never exists, rendering the normal branded 404.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice("/products/".length);
  if (PRODUCT_SLUG_PATTERN.test(slug)) {
    return NextResponse.next();
  }
  if (!isDecodable(slug)) {
    return new NextResponse(BROKEN_LINK_HTML, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  return NextResponse.rewrite(new URL("/products/not-a-product", request.url));
}

export const config = {
  matcher: "/products/:slug",
};
