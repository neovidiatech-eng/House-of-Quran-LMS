import { lazy, ComponentType } from "react";

/**
 * Enhanced React.lazy wrapper that automatically handles dynamic import failures
 * (e.g. 404 on JS chunk after a new deployment) by triggering a single page reload
 * to fetch the latest asset bundle.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenRefreshed =
      sessionStorage.getItem("page_refreshed_for_chunk") === "true";

    try {
      const component = await componentImport();
      if (pageHasAlreadyBeenRefreshed) {
        sessionStorage.removeItem("page_refreshed_for_chunk");
      }
      return component;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "";
      const isDynamicImportError =
        error?.name === "TypeError" ||
        errorMessage.includes("Failed to fetch dynamically imported module") ||
        errorMessage.includes("Importing a module script failed") ||
        errorMessage.includes("Loading chunk") ||
        errorMessage.includes("404");

      if (isDynamicImportError && !pageHasAlreadyBeenRefreshed) {
        sessionStorage.setItem("page_refreshed_for_chunk", "true");
        window.location.reload();
        // Return pending promise to let React suspense wait smoothly while browser reloads
        return new Promise<{ default: T }>(() => {});
      }

      throw error;
    }
  });
}
