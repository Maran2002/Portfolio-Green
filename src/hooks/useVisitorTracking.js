import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchWithAuth } from "../utils/apiConfig";

const getSessionId = () => {
  let id = sessionStorage.getItem("_vsid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_vsid", id);
  }
  return id;
};

export const useVisitorTracking = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const track = async () => {
      try {
        const searchParams = new URLSearchParams(
          window.location.search ||
          window.location.search ||
          (window.location.hash.includes("?") ? window.location.hash.substring(window.location.hash.indexOf("?")) : "")
        );
        const urlRef = searchParams.get("por-ref");
        const referrer = urlRef || document.referrer || "unknown";

        await fetchWithAuth("/api/track", {
          method: "POST",
          body: {
            page: pathname,
            sessionId: getSessionId(),
            referrer,
            language: navigator.language || "",
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          },
        });
      } catch {
        // silent — tracking failure must never affect the user experience
      }
    };

    track();
  }, [pathname]);
};
