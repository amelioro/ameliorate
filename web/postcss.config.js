module.exports = {
  plugins: {
    "postcss-flexbugs-fixes": {},
    "postcss-nested": {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 2,
      features: {
        "custom-properties": false,
      },
    },
  },
};
