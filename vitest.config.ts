import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["./src/**/*.{test,spec}.?(c|m)[jt]s?(x)"], // default from https://vitest.dev/config/#include but looking only at src/
    setupFiles: ["./scripts/setupTests.ts"],
  },
});
