import Link from "next/link";

interface EmptyStateProps {
  /** Show a "clear filters" action when the emptiness is caused by filters. */
  canClear: boolean;
}

export function EmptyState({ canClear }: EmptyStateProps) {
  return (
    <div className="border-y border-sand py-20 text-center">
      <p className="font-serif text-3xl text-balance">No products match your search or filters.</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Try a different name, widen the price range or choose another category.
      </p>
      {canClear && (
        <Link href="/products" className="btn-ink mt-8">
          Clear all filters
        </Link>
      )}
    </div>
  );
}
