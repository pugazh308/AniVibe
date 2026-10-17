import type { JSX } from "react";
import type { CategorySlug } from "@/lib/catalog/types";

/*
 * Category "object studies": quiet line drawings on neutral grounds, used
 * until real product photography exists. They depict generic objects and
 * traditional folk motifs — no characters, franchises or logos — and are
 * always labelled as placeholders. Drawn in a 400 × 500 (4:5) space.
 */

const INK = "#171717";
const IVORY = "#f5f1e9";
const PAPER = "#ede7dd";
const SAND = "#d8cfc2";
const STONE = "#77716b";
const WINE = "#783c4a";

/** Three restrained tones (ground + accent). */
const TONES = [
  { ground: "bg-paper", accent: WINE },
  { ground: "bg-[#e8e0d3]", accent: STONE },
  { ground: "bg-[#f0ebe3]", accent: INK },
] as const;

/** Index into the three motifs per category, or the three tones. */
export type PlaceholderVariant = 0 | 1 | 2;

/**
 * Stable motif and tone for a key (e.g. a product id), so a placeholder never
 * changes between renders. Motif and tone are drawn from different parts of
 * the hash, so products that share a motif still differ in tone.
 */
export function placeholderStyleFor(key: string): { motif: PlaceholderVariant; tone: PlaceholderVariant } {
  let sum = 0;
  for (const char of key) sum = (sum + (char.codePointAt(0) ?? 0)) % 9973;
  return {
    motif: (sum % 3) as PlaceholderVariant,
    tone: (Math.floor(sum / 3) % 3) as PlaceholderVariant,
  };
}

const line = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const fine = { ...line, strokeWidth: 0.9 } as const;

interface ObjectProps {
  accent: string;
  motif?: PlaceholderVariant;
}

function Shadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx / 11} fill={INK} opacity={0.06} />;
}

/** A small turned-wood figure on a plinth: kokeshi, daruma or ceramic figure. */
export function MiniatureObject({ accent, motif = 0 }: ObjectProps) {
  return (
    <g>
      <Shadow cx={200} cy={381} rx={96} />
      <path d="M126 330h148v50H126z" fill={SAND} {...line} />
      <path d="M126 330l12-12h124l12 12" fill={IVORY} {...line} />
      {motif === 0 && (
        <>
          <rect x={166} y={212} width={68} height={106} rx={32} fill={IVORY} {...line} />
          <path d="M168 258h64" stroke={accent} strokeWidth={7} />
          <path d="M182 284h36M188 296h24" {...fine} />
          <circle cx={200} cy={180} r={36} fill={IVORY} {...line} />
          <path d="M164 178a36 36 0 0 1 72 0c-11-9-23-13-36-13s-25 4-36 13Z" fill={INK} />
        </>
      )}
      {motif === 1 && (
        <>
          <path d="M200 166c-48 0-70 52-70 96 0 36 22 56 70 56s70-20 70-56c0-44-22-96-70-96Z" fill={SAND} {...line} />
          <ellipse cx={200} cy={226} rx={40} ry={34} fill={IVORY} {...line} />
          <path d="M152 292h96" stroke={accent} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      {motif === 2 && (
        <>
          <path d="M176 318l10-96h28l10 96Z" fill={IVORY} {...line} />
          <path d="M184 262h32" stroke={accent} strokeWidth={6} />
          <circle cx={200} cy={196} r={28} fill={IVORY} {...line} />
          <ellipse cx={200} cy={170} rx={42} ry={8} fill={accent} {...line} />
          <path d="M186 168q14-22 28 0" fill={accent} {...line} />
        </>
      )}
    </g>
  );
}

/** A framed print leaning against the wall: sun and hills, moon and waves, or a torii gate. */
export function PosterObject({ accent, motif = 0 }: ObjectProps) {
  return (
    <g>
      <Shadow cx={204} cy={382} rx={112} />
      <g transform="rotate(-3 200 250)">
        <rect x={110} y={102} width={180} height={276} fill={IVORY} {...line} />
        <rect x={126} y={118} width={148} height={204} fill={PAPER} {...fine} />
        {motif === 0 && (
          <>
            <circle cx={200} cy={186} r={26} fill={accent} />
            <path d="M126 294l42-42 28 26 34-38 44 52v30H126Z" fill={SAND} {...fine} />
          </>
        )}
        {motif === 1 && (
          <>
            <path d="M226 150a30 30 0 1 0 22 46 24 24 0 1 1-22-46Z" fill={accent} />
            <path
              d="M126 270q18-16 37 0t37 0 37 0 37 0M126 290q18-16 37 0t37 0 37 0 37 0"
              fill="none"
              {...fine}
            />
            <path d="M126 304q18-16 37 0t37 0 37 0 37 0V322H126Z" fill={SAND} {...fine} />
          </>
        )}
        {motif === 2 && (
          <>
            <path d="M146 176q54-12 108 0" fill="none" stroke={accent} strokeWidth={9} strokeLinecap="round" />
            <path d="M156 196h88" stroke={accent} strokeWidth={6} strokeLinecap="round" />
            <path d="M170 182v120M230 182v120" stroke={accent} strokeWidth={8} strokeLinecap="round" />
            <path d="M126 304h148" {...fine} />
          </>
        )}
        <path d="M152 348h96M172 360h56" stroke={STONE} strokeWidth={1} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** A round die-cut sticker with a lifted edge, over a second one: star, cloud or rice ball. */
export function StickerObject({ accent, motif = 0 }: ObjectProps) {
  return (
    <g>
      <g transform="rotate(10 262 186)">
        <rect x={208} y={132} width={108} height={108} rx={26} fill={SAND} {...line} />
        <circle cx={262} cy={186} r={18} fill="none" stroke={IVORY} strokeWidth={5} />
      </g>
      <circle cx={190} cy={254} r={88} fill={IVORY} {...line} />
      <path d="M247 321Q236 300 266 298A88 88 0 0 1 247 321Z" fill={SAND} {...fine} />
      {motif === 0 && (
        <path
          d="m186 196 13 27 30 4-22 21 6 30-27-15-27 15 6-30-22-21 30-4Z"
          fill={accent}
          stroke={accent}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      )}
      {motif === 1 && (
        <path
          d="M150 272a22 22 0 0 1 4-43 30 30 0 0 1 56-10 24 24 0 0 1 30 26 22 22 0 0 1-6 27Z"
          fill={accent}
          stroke={accent}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      )}
      {motif === 2 && (
        <>
          <path d="M186 196q8-12 16 0l40 70q6 14-10 14h-76q-16 0-10-14Z" fill={IVORY} {...line} />
          <rect x={170} y={246} width={48} height={34} fill={accent} />
        </>
      )}
    </g>
  );
}

/** An acrylic charm on a split ring, hanging from a peg: crest, round or teardrop charm. */
export function KeychainObject({ accent, motif = 0 }: ObjectProps) {
  return (
    <g>
      <path d="M170 74h60" {...line} />
      <circle cx={200} cy={74} r={4} fill={INK} />
      <circle cx={200} cy={112} r={26} fill="none" {...line} />
      <circle cx={200} cy={112} r={21} fill="none" {...fine} />
      <ellipse cx={200} cy={150} rx={5} ry={9} fill="none" {...fine} />
      <ellipse cx={200} cy={166} rx={5} ry={9} fill="none" {...fine} />
      <circle cx={200} cy={184} r={7} fill="none" {...fine} />
      {motif === 0 && (
        <>
          <rect x={146} y={192} width={108} height={140} rx={24} fill={IVORY} {...line} />
          <circle cx={200} cy={208} r={5} fill={PAPER} {...fine} />
          <circle cx={200} cy={268} r={30} fill={accent} />
          <circle cx={200} cy={268} r={17} fill="none" stroke={IVORY} strokeWidth={2} />
        </>
      )}
      {motif === 1 && (
        <>
          <circle cx={200} cy={258} r={64} fill={IVORY} {...line} />
          <circle cx={200} cy={204} r={5} fill={PAPER} {...fine} />
          <path
            d="M200 232l7 16 17 2-13 11 4 17-15-9-15 9 4-17-13-11 17-2Z"
            fill={accent}
            stroke={accent}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </>
      )}
      {motif === 2 && (
        <>
          <path d="M200 192c34 44 56 74 56 104a56 56 0 0 1-112 0c0-30 22-60 56-104Z" fill={IVORY} {...line} />
          <circle cx={200} cy={214} r={5} fill={PAPER} {...fine} />
          <path d="M214 282a22 22 0 1 0 14 32 18 18 0 1 1-14-32Z" fill={accent} />
        </>
      )}
    </g>
  );
}

const OBJECTS: Record<CategorySlug, (props: ObjectProps) => JSX.Element> = {
  miniatures: MiniatureObject,
  posters: PosterObject,
  stickers: StickerObject,
  keychains: KeychainObject,
};

interface PlaceholderArtProps {
  category: CategorySlug;
  /** Which of the category's three drawings to show. */
  motif?: PlaceholderVariant;
  /** Which ground/accent tone to use. */
  tone?: PlaceholderVariant;
  /** Accessible description, e.g. "Placeholder illustration for Koi Pond Charm Keychain". */
  label: string;
  /** Short visible caption marking the image as a placeholder. */
  caption: string;
  className?: string;
}

/** A 4:5 placeholder image for a category, visibly and audibly marked as a placeholder. */
export function PlaceholderArt({ category, motif = 0, tone = 0, label, caption, className = "" }: PlaceholderArtProps) {
  const { ground, accent } = TONES[tone];
  const CategoryObject = OBJECTS[category];
  const standsOnShelf = category === "miniatures" || category === "posters";
  return (
    <div role="img" aria-label={label} className={`relative aspect-[4/5] overflow-hidden rounded-ui ${ground} ${className}`}>
      <svg viewBox="0 0 400 500" aria-hidden="true" className="absolute inset-0 size-full">
        {standsOnShelf && <path d="M28 380h344" stroke={SAND} strokeWidth={1} />}
        <CategoryObject accent={accent} motif={motif} />
      </svg>
      {/* Wraps rather than clips on narrow two-column phone cards (e.g. 150px wide at 360px). */}
      <span className="absolute right-3 bottom-3 left-3 text-[10px] leading-tight tracking-[0.12em] text-muted uppercase sm:right-4 sm:bottom-4 sm:left-4">
        {caption}
      </span>
    </div>
  );
}
