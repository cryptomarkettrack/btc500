// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

const HISTORICAL_CSV = "btc-usd-max.csv";
const MIN_CSV_BYTES = 50_000;

function historicalCsvPlugin(): Plugin {
  const src = path.resolve(process.cwd(), "public", HISTORICAL_CSV);

  return {
    name: "btc-historical-csv",
    buildStart() {
      if (!fs.existsSync(src)) {
        throw new Error(
          `[btc-historical-csv] public/${HISTORICAL_CSV} is missing. Historical simulator/DCA/timeline calculations cannot ship without it.`,
        );
      }
      const { size } = fs.statSync(src);
      if (size < MIN_CSV_BYTES) {
        throw new Error(
          `[btc-historical-csv] public/${HISTORICAL_CSV} is too small (${size} bytes). Refusing to build a production bundle without the archive.`,
        );
      }
      this.addWatchFile(src);
    },
    closeBundle() {
      if (!fs.existsSync(src)) return;
      const dests = [
        path.resolve(process.cwd(), "dist", "client", HISTORICAL_CSV),
        path.resolve(process.cwd(), "dist", "server", HISTORICAL_CSV),
        path.resolve(process.cwd(), ".output", "public", HISTORICAL_CSV),
        path.resolve(process.cwd(), ".output", "server", HISTORICAL_CSV),
      ];
      for (const dest of dests) {
        try {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
        } catch (err) {
          console.warn(`[btc-historical-csv] could not copy to ${dest}:`, err);
        }
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [historicalCsvPlugin()],
    build: {
      // Emit source maps so large first-party bundles satisfy Lighthouse's
      // "valid source maps" best-practice and debugging is possible in production.
      sourcemap: true,
      rollupOptions: {
        output: {
          // Split large chunks to avoid mobile browser memory limits
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom")) {
                return "vendor-react";
              }
              if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-query")) {
                return "vendor-router";
              }
              if (id.includes("recharts")) {
                return "vendor-charts";
              }
              if (id.includes("framer-motion")) {
                return "vendor-animation";
              }
              if (id.includes("@radix-ui")) {
                return "vendor-ui";
              }
            }
            return undefined;
          },
        },
      },
      // Increase chunk size warning limit since we're intentionally splitting
      chunkSizeWarningLimit: 1000,
    },
  },
});
