/** Thin-stroke inline icons (no icon library). Decorative: always pair with text or an sr-only label. */

const base = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function SearchIcon({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m12.75 12.75 4 4" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base}>
      <path d="M3.5 10h13M12 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base}>
      <path d="M16.5 10h-13M8 5.5 3.5 10 8 14.5" />
    </svg>
  );
}

export function PlusIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}
