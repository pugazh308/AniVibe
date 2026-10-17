"use client";

import { useEffect } from "react";

// False only until the first catalogue render after a full page load.
let renderedBefore = false;

interface CatalogFocusProps {
  /** Changes whenever the catalogue query changes (e.g. its URL search string). */
  navKey: string;
  /** id of the search field to focus when the URL hash targets it. */
  searchId: string;
  /** id of a focusable (tabIndex=-1) element to receive focus if it would otherwise be lost. */
  fallbackId: string;
}

/**
 * Keeps keyboard focus useful on the catalogue:
 * - Arriving at #search (the phone header's search link) focuses the search
 *   field, not just scrolls to it.
 * - When a client-side update removes the focused element (e.g. "Clear
 *   filters" disappears once the filters are cleared), focus moves to the
 *   catalogue heading instead of falling back to <body>.
 */
export function CatalogFocus({ navKey, searchId, fallbackId }: CatalogFocusProps) {
  useEffect(() => {
    const focusSearchIfTargeted = () => {
      if (window.location.hash === `#${searchId}`) document.getElementById(searchId)?.focus();
    };

    if (window.location.hash === `#${searchId}`) {
      focusSearchIfTargeted();
    } else if (renderedBefore && document.activeElement === document.body) {
      document.getElementById(fallbackId)?.focus({ preventScroll: true });
    }
    renderedBefore = true;

    window.addEventListener("hashchange", focusSearchIfTargeted);
    return () => window.removeEventListener("hashchange", focusSearchIfTargeted);
  }, [navKey, searchId, fallbackId]);

  return null;
}
