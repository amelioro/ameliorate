import path from "path";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // annoying to have to do these aliases and test.server.deps.inline, but these allow us to use
    // prismock with Prisma v7...
    alias: [
      // AI says that @pkgverse/prismock v2.0.4 still imports from the old Prisma 6 runtime path,
      // and that Prisma 7 renamed it from `runtime/library` to `runtime/client`.
      // Remove this alias once prismock is updated.
      {
        find: "@prisma/client/runtime/library",
        replacement: "@prisma/client/runtime/client",
      },
      // AI says that Prisma 7 with custom output doesn't create .prisma/client/default, but
      // @prisma/client tries to re-export from there. Redirect to our custom output.
      // Use exact match to avoid catching subpath imports like @prisma/client/runtime/*.
      {
        find: /^@prisma\/client$/,
        replacement: path.resolve(__dirname, "src/db/generated/prisma/client"),
      },
    ],
  },
  test: {
    include: ["./src/**/*.{test,spec}.?(c|m)[jt]s?(x)"], // default from https://vitest.dev/config/#include but looking only at src/
    setupFiles: ["./scripts/setupTests.ts"],
    server: {
      deps: {
        // AI says this is required for the alias to apply to prismock's imports
        inline: ["@pkgverse/prismock"],
      },
    },
  },
});
