import { defineConfig } from "vitest/config"

// The app's vite.config.ts builds the GUI bundle and must not run for unit tests.
export default defineConfig({
  // Solid ships a non-reactive server build under the "node" condition; the shared layer is client code.
  resolve: { conditions: ["browser", "development"] },
  ssr: { resolve: { conditions: ["browser", "development"] } },
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
})
