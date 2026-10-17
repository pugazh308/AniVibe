import { CATEGORY_SLUGS, type Category, type CategorySlug } from "./types";

export const CATEGORIES: readonly Category[] = [
  {
    slug: "miniatures",
    name: "Anime Miniatures",
    shortName: "Miniatures",
    description: "Small display figures for desks and shelves.",
  },
  {
    slug: "posters",
    name: "Posters",
    shortName: "Posters",
    description: "Wall prints in A4 and A3 sizes.",
  },
  {
    slug: "stickers",
    name: "Mini Stickers",
    shortName: "Stickers",
    description: "Small stickers for laptops, bottles and notebooks.",
  },
  {
    slug: "keychains",
    name: "Keychains",
    shortName: "Keychains",
    description: "Charms for keys, bags and pencil cases.",
  },
];

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function getCategory(slug: CategorySlug): Category {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) {
    throw new Error(`Unknown category slug: ${slug}`);
  }
  return category;
}
