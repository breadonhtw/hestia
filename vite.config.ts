import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const isProd = mode === "production";

  const plugins = [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ) as any[];

  if (process.env.ANALYZE) {
    const { visualizer } = await import("rollup-plugin-visualizer");
    plugins.push(
      visualizer({
        filename: "stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      })
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Avoid inflating production bundle size with sourcemaps
      sourcemap: !isProd,
      target: "es2020",
      cssCodeSplit: true,
      reportCompressedSize: true,
      modulePreload: { polyfill: false },
      minify: "esbuild",
      rollupOptions: {
        output: {
          // Create meaningful vendor chunks to improve caching
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@supabase")) return "vendor-supabase";
              if (id.includes("@tanstack")) return "vendor-react-query";
              if (id.includes("react-router")) return "vendor-router";
              if (id.includes("lucide-react")) return "vendor-icons";
              if (id.includes("@radix-ui")) return "vendor-radix";
              if (id.includes("framer-motion")) return "vendor-motion";
              if (id.match(/[\\/]react(-dom)?[\\/]/)) return "vendor-react";
            }
          },
        },
      },
      // Drop noisy logs in production bundles
      ...(isProd
        ? {
            terserOptions: undefined,
            // esbuild options
            // @ts-ignore - vite passes through to esbuild
            esbuild: {
              drop: ["console", "debugger"],
            },
          }
        : {}),
    },
    optimizeDeps: {
      entries: ["./index.html", "./src/main.tsx"],
    },
  };
});
