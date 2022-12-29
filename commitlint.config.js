module.exports = {
  extends: ["@commitlint/config-conventional"],
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
