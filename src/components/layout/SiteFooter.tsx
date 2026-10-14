import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog/categories";
import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand">
      <Container className="grid gap-12 py-14 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16">
        <div>
          <Link href="/" className="font-serif text-3xl leading-none">
            AniVibe
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Anime merchandise for fans in India. This is a catalogue preview: products, prices and stock levels are
            sample data. Prices are in Indian rupees.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="eyebrow">Shop</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href="/products" className="inline-flex min-h-7 items-center hover:text-wine">
                All products
              </Link>
            </li>
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="inline-flex min-h-7 items-center hover:text-wine"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container>
        {/* The rule sits inside the container padding so it aligns with the content edge. */}
        <div className="border-t border-sand py-6 text-xs text-muted">
          <p>© AniVibe</p>
        </div>
      </Container>
    </footer>
  );
}
