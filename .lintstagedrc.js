import path from "path";

// would be nice to not have to use this, but `next lint` doesn't support having multiple files passed
// in with a single flag; https://nextjs.org/docs/app/api-reference/config/eslint#running-lint-on-staged-files
const buildEslintCommand = (filenames) =>
  `next lint --format stylish --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

const config = {
  // We shouldn't pass files like `yml` to eslint because we haven't configured eslint for that
  // and we want to run prettier against those because prettier has good defaults.
  // Annoyingly we also don't want two different globs to overlap because of concurrency issues https://github.com/lint-staged/lint-staged?tab=readme-ov-file#task-concurrency
  // So we run prettier synchronously with eslint for overlapping files, and concurrently for non-overlapping files.
  "!(**/*.{js,jsx,ts,tsx})": "prettier --ignore-unknown --write",
  "**/*.{js,jsx,ts,tsx}": ["prettier --ignore-unknown --write", buildEslintCommand],
};
export default config;
