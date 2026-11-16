import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "../i18n";

// Auto-reload once when Vite fails to preload or fetch dynamic chunks due to deployment updates
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const pageHasAlreadyBeenRefreshed =
    sessionStorage.getItem("page_refreshed_for_chunk") === "true";
  if (!pageHasAlreadyBeenRefreshed) {
    sessionStorage.setItem("page_refreshed_for_chunk", "true");
    window.location.reload();
  }
});

window.addEventListener("error", (event) => {
  const message = event.message || "";
  if (message.includes("Failed to fetch dynamically imported module")) {
    const pageHasAlreadyBeenRefreshed =
      sessionStorage.getItem("page_refreshed_for_chunk") === "true";
    if (!pageHasAlreadyBeenRefreshed) {
      sessionStorage.setItem("page_refreshed_for_chunk", "true");
      window.location.reload();
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

