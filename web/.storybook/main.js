// unsure how to solve `tsconfig-paths-webpack-plugin: Found no baseUrl in tsconfig.json` warnings
// this looked promising https://github.com/storybookjs/storybook/issues/3291#issuecomment-686760728
// but didn't seem to work
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-next",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  core: {},
};
