import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: {
      tsconfig: "tests/tsconfig.json",
    },
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
    },
  },
});
