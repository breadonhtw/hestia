import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import "./index.css";

// Dynamically add preconnect/dns-prefetch for Supabase to improve initial network setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
if (supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).origin;
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = host;
    preconnect.crossOrigin = "anonymous";
    document.head.appendChild(preconnect);

    const dnsPrefetch = document.createElement("link");
    dnsPrefetch.rel = "dns-prefetch";
    dnsPrefetch.href = host;
    document.head.appendChild(dnsPrefetch);
  } catch {}
}

// Idle prefetch: warm likely-next route bundles after first paint
if ((window as any).requestIdleCallback) {
  (window as any).requestIdleCallback(() => {
    // Hint the browser to prefetch route bundles; Vite will resolve these
    const prefetch = (path: string) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "script";
      link.href = path;
      document.head.appendChild(link);
    };
    // Heuristics: users commonly go to browse/profile next
    try {
      // These dynamic imports won't execute; they let Vite discover chunks
      import("./pages/Browse");
      import("./pages/CreatorProfile");
    } catch {}
  });
}

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
    <SpeedInsights />
  </>
);
