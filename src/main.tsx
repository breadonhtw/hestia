import { createRoot } from "react-dom/client";
// Lazy-load analytics only in production to avoid affecting TTI/LCP
let Analytics: React.ComponentType | null = null;
let SpeedInsights: React.ComponentType | null = null;
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

const isProdHost =
  typeof window !== "undefined" &&
  /(?:^|\.)hestia\.sg$/.test(window.location.hostname);

// Create root once and reuse it
const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

function render() {
  const RootAnalytics = Analytics;
  const RootSpeed = SpeedInsights;
  root.render(
    <>
      <App />
      {isProdHost && RootAnalytics ? <RootAnalytics /> : null}
      {isProdHost && RootSpeed ? <RootSpeed /> : null}
    </>
  );
}

if (isProdHost) {
  // Defer importing analytics until after first paint
  queueMicrotask(async () => {
    try {
      const [{ Analytics: A }, { SpeedInsights: S }] = await Promise.all([
        import("@vercel/analytics/react"),
        import("@vercel/speed-insights/react"),
      ]);
      Analytics = A as any;
      SpeedInsights = S as any;
      // Re-render to attach analytics components
      render();
    } catch {}
  });
}

render();
