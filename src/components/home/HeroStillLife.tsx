import { KeychainObject, MiniatureObject, PosterObject, StickerObject } from "@/components/product/PlaceholderArt";

/**
 * Hero illustration: the four category object studies arranged as a quiet
 * still life on a shelf. An illustration of the categories — explicitly not
 * product photography — and labelled as such.
 */
export function HeroStillLife() {
  return (
    <figure>
      <div
        role="img"
        aria-label="Illustration of a figure on a plinth, a framed print, a hanging keychain and a sticker on a shelf. Not product photography."
        className="relative aspect-[5/4] overflow-hidden rounded-ui bg-paper"
      >
        <svg viewBox="0 0 800 640" aria-hidden="true" className="absolute inset-0 size-full">
          <path d="M0 520h800" stroke="#d8cfc2" strokeWidth={1} />
          <g transform="translate(170 83) scale(1.15)">
            <PosterObject accent="#783c4a" motif={0} />
          </g>
          <g transform="translate(-20 159) scale(0.95)">
            <MiniatureObject accent="#783c4a" motif={0} />
          </g>
          <g transform="translate(480 11) scale(0.8)">
            <KeychainObject accent="#77716b" motif={0} />
          </g>
          <g transform="translate(530 329) scale(0.55)">
            <StickerObject accent="#171717" motif={0} />
          </g>
        </svg>
      </div>
      <figcaption className="mt-3 text-[10px] tracking-[0.14em] text-muted uppercase">
        Illustration · not product photography
      </figcaption>
    </figure>
  );
}
