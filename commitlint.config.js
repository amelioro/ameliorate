// eslint-disable-next-line functional/immutable-data
module.exports = {
  extends: ["@commitlint/config-conventional"],
  helpUrl: "https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#conventional-commits",
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build", // modifies the build process / pipeline for the application
        "chore", // is a catch-all for any change that doesn't fit into another category
        "ci", // modifies the continuous integration pipeline
        "db", // modifies the database
        "docs", // adds or improves documentation
        "feat", // adds new functionality
        "fix", // fixes a bug
        "touchup", // small improvement, too small for "feat" or "refactor"
        "perf", // improves performance without functionality changes
        "refactor", // doesn't add functionality and doesn't fix a bug
        "revert", // undoes a previous commit
        "style", // does not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        "test", // updates testing
      ],
    ],
  },
};
