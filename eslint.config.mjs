// @ts-check
import { dirname } from "path";
import { fileURLToPath } from "url";

import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import functional from "eslint-plugin-functional";
// import * as importPlugin from "eslint-plugin-import";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat for plugins that don't support flat config yet
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  // Reuse .gitignore patterns + add additional ignores
  includeIgnoreFile(`${__dirname}/.gitignore`),
  // Ignore auto-generated Next.js type declaration files; these aren't in gitignore yet because
  // `build` needs to be run to generate them, which is slow - probably ignore them after next 15.5,
  // which includes `next typegen` to quickly generate it https://nextjs.org/docs/app/api-reference/cli/next#next-typegen-options
  { ignores: ["**/next-env.d.ts"] },

  // ============================================
  // BASE CONFIG (all js/ts files)
  // ============================================
  {
    files: ["**/*.{js,jsx,ts,tsx,cjs,mjs}"],
    extends: [compat.extends("next/core-web-vitals")],
    // TODO: try adding import plugin here after upgrading to eslint v9 ; right now
    // next/core-web-vitals already includes it, and there's a "cannot redefine plugin" error, but
    // there's a ticket to fix this https://github.com/eslint/eslintrc/issues/135
    // plugins: { functional, "better-tailwindcss": betterTailwindcss, import: importPlugin },
    plugins: { functional, "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": { entryPoint: "src/web/common/globals.css" },
    },
    rules: {
      // base rules
      ...eslint.configs.recommended.rules,
      "no-param-reassign": ["error", { props: true }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "sort-imports": [
        "error",
        {
          ignoreDeclarationSort: true, // don't want to sort import lines, use eslint-plugin-import instead
          allowSeparatedGroups: true, // separating imports by group seems more readable
        },
      ],

      // functional rules
      "functional/functional-parameters": [
        "error",
        {
          // Allow currying with arbitrary arguments (e.g. for zustand middleware)
          allowRestParameter: true,
          enforceParameterCount: false,
        },
      ],
      "functional/immutable-data": ["error", { ignoreIdentifierPattern: ["router"] }],
      "functional/no-classes": "error",
      "functional/no-let": "error",
      "functional/no-loop-statements": "error",
      "functional/no-this-expressions": "error",

      // import rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Built-in imports (come from NodeJS native) go first
            "external",
            "internal",
            ["sibling", "parent"], // <- Relative imports, the sibling and parent types they can be mingled together
            "index",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],
      // apparently ts itself checks these https://typescript-eslint.io/troubleshooting/performance-troubleshooting/#eslint-plugin-import
      "import/named": "off",
      "import/namespace": "off",

      "react/no-unescaped-entities": "off",
    },
  },

  // ============================================
  // TYPESCRIPT CONFIG (all ts files)
  // ============================================
  {
    files: ["**/*.{ts,tsx}"],
    // lean strict on linting, can reduce strictness if/when things get annoying
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/member-ordering": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      // annoying when wanting to overspecify different types that happen to be the same but could become different
      "@typescript-eslint/no-duplicate-type-constituents": "off",
      // annoying to have to dupe this with the js version, but it seems like the ts version just _extends_ functionality
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "all", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: true,
          allowNever: true,
        },
      ],
    },
  },

  // ============================================
  // TAILWIND CONFIG (root only)
  // ============================================
  // Could make this shared across projects, but docs-site (nextra) uses its own tailwind prefix,
  // which triggers no-unregistered-classes errors on everything, and I don't think I care to get
  // that set up right now.
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    settings: {
      "better-tailwindcss": { entryPoint: "src/web/common/globals.css" },
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      // single lines have felt fine so far, don't encourage breaking classes into multiple lines
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-unregistered-classes": [
        "error",
        {
          // use anchored regex patterns (^...$) to match more strictly, e.g. "flashlight-modes" wouldn't be prevented without the `$` at the end
          ignore: [
            "^nopan$",
            "^react-flow.*",
            "^selected$",
            "^flashlight-mode$",
            "^spotlight-.*",
            "^diagram-node$",
            "^diagram-edge$",
          ],
        },
      ],
    },
  },

  // ============================================
  // RELATIVE PATH CONFIG (root and scripts)
  // ============================================
  // separate from other projects because only root is set up with `@` path mapping
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    plugins: { "no-relative-import-paths": noRelativeImportPaths },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        { allowSameFolder: false, rootDir: "src", prefix: "@" },
      ],
    },
  },

  // ============================================
  // PRETTIER (LLM thinks this should be last to override formatting rules)
  // ============================================
  prettier,
);
