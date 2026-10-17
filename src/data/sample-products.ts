/**
 * SAMPLE DATA — NOT REAL INVENTORY.
 *
 * Placeholder products used to build and test the catalogue until real stock
 * is entered. Names are fictional and generic: no real franchises, characters,
 * brands or artwork. Prices and stock levels are illustrative only and make no
 * claim about licensing, authenticity or availability of any actual product.
 *
 * The set deliberately covers edge cases the UI must render correctly:
 * out-of-stock items, low stock at both boundaries (1 and 5), stock just above
 * the threshold (6), a price with paise (₹49.50) and equal prices for sort
 * tie-breaking.
 */

import type { Product } from "@/lib/catalog/types";

export const SAMPLE_PRODUCTS: readonly Product[] = [
  // ── Miniatures ────────────────────────────────────────────────────────────
  {
    id: "SAMPLE-MIN-001",
    slug: "crimson-ronin-mini-figure",
    name: "Crimson Ronin Mini Figure",
    category: "miniatures",
    pricePaise: 129900,
    stockQuantity: 12,
    description:
      "A small chibi-style figure of a wandering swordsman in red armour, posed mid-stride on a round base.",
    specs: [
      { label: "Material", value: "PVC" },
      { label: "Height", value: "Approx. 7 cm" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-MIN-002",
    slug: "moonlit-fox-spirit-mini-figure",
    name: "Moonlit Fox Spirit Mini Figure",
    category: "miniatures",
    pricePaise: 89900,
    stockQuantity: 3,
    description:
      "A seated nine-tailed fox spirit with a crescent-moon charm, sized for a desk or monitor stand.",
    specs: [
      { label: "Material", value: "PVC" },
      { label: "Height", value: "Approx. 6 cm" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-MIN-003",
    slug: "mecha-pilot-chibi-figure",
    name: "Mecha Pilot Chibi Figure",
    category: "miniatures",
    pricePaise: 64900,
    stockQuantity: 0,
    description: "A chibi pilot in a flight suit holding a helmet, with a hexagonal display base.",
    specs: [
      { label: "Material", value: "PVC" },
      { label: "Height", value: "Approx. 5.5 cm" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-MIN-004",
    slug: "sakura-swordswoman-mini-figure",
    name: "Sakura Swordswoman Mini Figure",
    category: "miniatures",
    pricePaise: 104900,
    stockQuantity: 7,
    description:
      "A swordswoman in a pink haori standing beneath a sculpted cherry-blossom branch.",
    specs: [
      { label: "Material", value: "PVC" },
      { label: "Height", value: "Approx. 8 cm" },
    ],
    isSample: true,
  },

  // ── Posters ───────────────────────────────────────────────────────────────
  {
    id: "SAMPLE-POS-001",
    slug: "neon-city-skyline-poster-a3",
    name: "Neon City Skyline Poster (A3)",
    category: "posters",
    pricePaise: 29900,
    stockQuantity: 25,
    description: "A rain-soaked city skyline at night, lit in magenta and cyan signage.",
    specs: [
      { label: "Size", value: "A3 (297 × 420 mm)" },
      { label: "Finish", value: "Matte" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-POS-002",
    slug: "starfall-shrine-poster-a4",
    name: "Starfall Shrine Poster (A4)",
    category: "posters",
    pricePaise: 19900,
    stockQuantity: 5,
    description: "A hillside shrine gate under a sky full of falling stars.",
    specs: [
      { label: "Size", value: "A4 (210 × 297 mm)" },
      { label: "Finish", value: "Matte" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-POS-003",
    slug: "cloud-serpent-poster-a3",
    name: "Cloud Serpent Poster (A3)",
    category: "posters",
    pricePaise: 34900,
    stockQuantity: 0,
    description: "A long serpent-like dragon coiling through storm clouds above a mountain range.",
    specs: [
      { label: "Size", value: "A3 (297 × 420 mm)" },
      { label: "Finish", value: "Gloss" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-POS-004",
    slug: "midnight-ramen-stall-poster-a4",
    name: "Midnight Ramen Stall Poster (A4)",
    category: "posters",
    pricePaise: 19900,
    stockQuantity: 14,
    description: "A glowing street-side noodle stall on a quiet late-night lane.",
    specs: [
      { label: "Size", value: "A4 (210 × 297 mm)" },
      { label: "Finish", value: "Matte" },
    ],
    isSample: true,
  },

  // ── Mini stickers ─────────────────────────────────────────────────────────
  {
    id: "SAMPLE-STK-001",
    slug: "chibi-cat-ninja-mini-sticker",
    name: "Chibi Cat Ninja Mini Sticker",
    category: "stickers",
    pricePaise: 4950,
    stockQuantity: 40,
    description: "A round-faced cat in a ninja hood, mid-leap.",
    specs: [
      { label: "Size", value: "Approx. 5 × 5 cm" },
      { label: "Finish", value: "Vinyl, matte" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-STK-002",
    slug: "onigiri-friends-mini-sticker-sheet",
    name: "Onigiri Friends Mini Sticker Sheet",
    category: "stickers",
    pricePaise: 9900,
    stockQuantity: 1,
    description: "A sheet of six small rice-ball characters with different expressions.",
    specs: [
      { label: "Sheet size", value: "Approx. 10 × 7 cm" },
      { label: "Stickers per sheet", value: "6" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-STK-003",
    slug: "pixel-spirit-mini-sticker-pack",
    name: "Pixel Spirit Mini Sticker Pack",
    category: "stickers",
    pricePaise: 14900,
    stockQuantity: 18,
    description: "Retro pixel-art forest spirits in a pack of assorted designs.",
    specs: [
      { label: "Stickers per pack", value: "8" },
      { label: "Finish", value: "Vinyl, gloss" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-STK-004",
    slug: "retro-mecha-mini-sticker",
    name: "Retro Mecha Mini Sticker",
    category: "stickers",
    pricePaise: 5900,
    stockQuantity: 6,
    description: "A boxy giant robot drawn in a vintage cel-shaded style.",
    specs: [
      { label: "Size", value: "Approx. 6 × 4 cm" },
      { label: "Finish", value: "Vinyl, matte" },
    ],
    isSample: true,
  },

  // ── Keychains ─────────────────────────────────────────────────────────────
  {
    id: "SAMPLE-KEY-001",
    slug: "lucky-daruma-acrylic-keychain",
    name: "Lucky Daruma Acrylic Keychain",
    category: "keychains",
    pricePaise: 17900,
    stockQuantity: 9,
    description: "A double-sided acrylic charm of a red daruma doll.",
    specs: [
      { label: "Material", value: "Acrylic" },
      { label: "Charm size", value: "Approx. 5 cm" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-KEY-002",
    slug: "ghost-lantern-acrylic-keychain",
    name: "Ghost Lantern Acrylic Keychain",
    category: "keychains",
    pricePaise: 14900,
    stockQuantity: 2,
    description: "A paper-lantern spirit with a cheeky grin, printed on clear acrylic.",
    specs: [
      { label: "Material", value: "Acrylic" },
      { label: "Charm size", value: "Approx. 4.5 cm" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-KEY-003",
    slug: "star-witch-rubber-keychain",
    name: "Star Witch Rubber Keychain",
    category: "keychains",
    pricePaise: 22900,
    stockQuantity: 0,
    description: "A soft rubber charm of a young witch riding a star-tipped broom.",
    specs: [
      { label: "Material", value: "PVC rubber" },
      { label: "Charm size", value: "Approx. 6 cm" },
    ],
    isSample: true,
  },
  {
    id: "SAMPLE-KEY-004",
    slug: "koi-pond-charm-keychain",
    name: "Koi Pond Charm Keychain",
    category: "keychains",
    pricePaise: 19900,
    stockQuantity: 11,
    description: "Two koi circling a lily pad, on a round acrylic charm.",
    specs: [
      { label: "Material", value: "Acrylic" },
      { label: "Charm size", value: "Approx. 4 cm" },
    ],
    isSample: true,
  },
];
