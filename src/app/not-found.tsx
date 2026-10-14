import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-serif text-5xl leading-none sm:text-6xl">Page not found</h1>
      <p className="mx-auto mt-6 max-w-md text-muted">
        That page doesn’t exist. The link may be wrong or the product may have been removed.
      </p>
      <Link href="/products" className="btn-ink mt-10 min-h-12 px-7">
        Browse all products
      </Link>
    </Container>
  );
}
