import Link from "next/link";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { HeroStillLife } from "@/components/home/HeroStillLife";
import { Container } from "@/components/layout/Container";
import { PlaceholderArt } from "@/components/product/PlaceholderArt";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getCategories, getHomepageSelection } from "@/lib/catalog/repository";

export default async function HomePage() {
  const [categories, selection] = await Promise.all([getCategories(), getHomepageSelection()]);

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="border-b border-sand">
        <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:py-24">
          <div className="lg:col-span-7">
            <p className="eyebrow">Anime merchandise · India</p>
            <h1
              id="hero-heading"
              className="mt-6 font-serif text-[clamp(3rem,7.2vw,6rem)] leading-[0.95] tracking-[-0.015em] text-balance"
            >
              Small things,
              <br />
              <em className="text-wine">chosen</em> with care.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Anime miniatures, posters, stickers and keychains for fans in India — a considered collection, priced to
              stay within reach.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/products" className="btn-ink min-h-12 px-7">
                Shop the collection
                <ArrowRightIcon />
              </Link>
              <Link href="#categories" className="link-quiet text-sm">
                Explore the categories
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <HeroStillLife />
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-6">
        <Container className="py-20 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-sand pb-6">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 id="categories-heading" className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                Four categories
              </h2>
            </div>
            <Link href="/products" className="link-quiet text-sm">
              View all products
            </Link>
          </div>

          <ul
            role="list"
            className="mt-12 grid grid-cols-1 gap-x-5 gap-y-12 min-[360px]:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4"
          >
            {categories.map((category, index) => (
              <li key={category.slug} className="flex min-w-0">
                <article className="group relative flex flex-1 flex-col has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-wine">
                  {/* Third motif set: different drawings from the hero and the product selection below. */}
                  <PlaceholderArt
                    category={category.slug}
                    motif={2}
                    label={`Placeholder illustration for ${category.name}. Not a product photo.`}
                    caption="Placeholder image"
                  />
                  <span aria-hidden="true" className="mt-5 block text-[11px] tracking-[0.16em] text-muted tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-serif text-[1.5rem] leading-tight text-balance sm:text-[1.75rem]">
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {category.name}
                    </Link>
                  </h3>
                  <p className="mt-2 mb-4 text-sm leading-relaxed text-muted">{category.description}</p>
                  <span
                    aria-hidden="true"
                    className="mt-auto inline-flex items-center gap-2 self-start text-[12px] tracking-[0.14em] uppercase transition-colors group-hover:text-wine"
                  >
                    Explore <ArrowRightIcon className="size-3.5" />
                  </span>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Selection */}
      <section aria-labelledby="selection-heading" className="border-t border-sand">
        <Container className="py-20 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">A first look</p>
              <h2 id="selection-heading" className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
                One from each category
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                A small cross-section of the sample catalogue — one piece from each of the four categories.
              </p>
            </div>
            <Link href="/products" className="link-quiet text-sm">
              Shop all products
            </Link>
          </div>
          <div className="mt-12">
            <ProductGrid products={selection} wideColumns={4} />
          </div>
        </Container>
      </section>

      {/* Brand introduction */}
      <section aria-labelledby="about-heading" className="border-t border-sand">
        <Container className="grid gap-8 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <p className="eyebrow lg:col-span-3">About AniVibe</p>
          <div className="lg:col-span-8">
            <h2 id="about-heading" className="font-serif text-3xl leading-[1.1] text-balance sm:text-[2.75rem]">
              An independent anime store for fans in India, built around a small, considered range.
            </h2>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted">
              Miniatures, posters, stickers and keychains — chosen for how they look on a shelf, a desk or a bag, and
              priced to stay within reach. The catalogue you see today is a preview built on sample products.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
