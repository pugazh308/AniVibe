import { formatPrice } from "@/lib/catalog/money";

interface PriceTagProps {
  pricePaise: number;
  size?: "md" | "lg";
}

const sizeClass = { md: "text-[15px]", lg: "text-2xl" } as const;

/** Formatted INR price. Formatting happens on the server, so there is no hydration mismatch. */
export function PriceTag({ pricePaise, size = "md" }: PriceTagProps) {
  return (
    <p className={`${sizeClass[size]} text-ink tabular-nums`}>
      <span className="sr-only">Price: </span>
      {formatPrice(pricePaise)}
    </p>
  );
}
