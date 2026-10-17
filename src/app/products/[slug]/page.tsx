import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PriceTag } from "@/components/product/PriceTag";
import { ProductMedia } from "@/components/product/ProductMedia";
import { StockBadge } from "@/components/product/StockBadge";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getCategory } from "@/lib/catalog/categories";
import { getAllProductSlugs, getProductBySlug } from "@/lib/catalog/repository";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Every product page is prebuilt from generateStaticParams; unknown slugs are a
// hard 404. When products move to a database this page must change too:
// prebuilt pages freeze price and stock at build time, and products added
// after a build would 404 until the next build. Render on demand or revalidate.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  if (!product.isSample) return { title: product.name, description: product.description };
  // Keep the sample-data marker in titles/descriptions shown outside the page (tabs, link previews).
  return {
    title: `${product.name} (sample)`,
    description: `Sample listing — not real stock. ${product.description}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const categoryHref = `/products?category=${category.slug}`;

  return (
    <Container className="pt-8 pb-24 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/products" className="inline-flex min-h-6 items-center hover:text-ink">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={categoryHref} className="inline-flex min-h-6 items-center hover:text-ink">
              {category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="min-w-0 text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <article
        data-slug={product.slug}
        data-price-paise={product.pricePaise}
        data-stock={product.stockQuantity}
        className="mt-8 grid gap-10 sm:mt-10 md:grid-cols-12 lg:gap-16"
      >
        <div className="min-w-0 md:col-span-6 lg:col-span-7">
          <ProductMedia product={product} sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw" prominent />
        </div>

        <div className="min-w-0 md:col-span-6 lg:col-span-5 lg:pt-4">
          <p className="eyebrow">{category.name}</p>
          <h1 className="mt-4 font-serif text-[2.75rem] leading-[1.02] tracking-[-0.01em] text-balance md:text-5xl lg:text-6xl">
            {product.name}
          </h1>

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y border-sand py-5">
            <PriceTag pricePaise={product.pricePaise} size="lg" />
            <StockBadge quantity={product.stockQuantity} />
          </div>
          {product.isSample && (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              This is a sample listing: the price and stock level are for preview only. Ordering isn’t available yet.
            </p>
          )}

          <p className="mt-8 max-w-prose text-base leading-relaxed">{product.description}</p>

          <h2 className="eyebrow mt-12">Details</h2>
          <dl className="mt-4 border-t border-sand text-sm">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-6 border-b border-sand py-3">
                <dt className="text-muted">{spec.label}</dt>
                <dd className="text-right">{spec.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-6 border-b border-sand py-3">
              <dt className="text-muted">Product code</dt>
              <dd className="text-right font-mono text-[13px]">{product.id}</dd>
            </div>
          </dl>

          <Link href={categoryHref} className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm hover:text-wine">
            <ArrowLeftIcon />
            Back to {category.name}
          </Link>
        </div>
      </article>
    </Container>
  );
}
