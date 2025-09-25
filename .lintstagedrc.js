import path from "path";

// would be nice to not have to use this, but `next lint` doesn't support having multiple files passed
// in with a single flag; https://nextjs.org/docs/app/api-reference/config/eslint#running-lint-on-staged-files
const buildEslintCommand = (filenames) =>
  `next lint --format stylish --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  "*": ["prettier --ignore-unknown --write", buildEslintCommand],
};
