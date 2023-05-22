module.exports = {
  extends: ["@commitlint/config-conventional"],
  helpUrl:
    "https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#conventional-commits",
  rules: {
    "type-enum": [
      2,
      "always",
      // custom types should have comments explaining them
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "touchup", // small improvement, too small for "feat" or "refactor"
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
  },
};
