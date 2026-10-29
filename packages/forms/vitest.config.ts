import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // "server-only" throws outside a React Server Components bundle.
    alias: { "server-only": fileURLToPath(new URL("./test/stubs/empty.ts", import.meta.url)) },
  },
});
