import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@cael/os-light": fileURLToPath(new URL("./node_modules/@cael/os-light/dist/index.js", import.meta.url))
    }
  },
  test: {
    environment: "node"
  }
});
