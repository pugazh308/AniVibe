"use client";

import { useEffect } from "react";

/**
 * On Back/Forward the browser may restore form controls to what the user had
 * typed or selected before leaving, even though the products shown belong to
 * the page's own URL. Resetting the form puts every control — including the
 * search and sort fields joined via the `form` attribute — back to the values
 * this page was rendered with, so the controls always match the results.
 */
export function CatalogFormRestore({ formId }: { formId: string }) {
  useEffect(() => {
    const reset = () => (document.getElementById(formId) as HTMLFormElement | null)?.reset();

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type === "back_forward") reset();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reset();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [formId]);

  return null;
}
