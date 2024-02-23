const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

// eslint-disable-next-line functional/immutable-data -- when trying to use ESM, nextra encounters error "The requested module 'remark-reading-time' does not provide an export named 'default'"
module.exports = withNextra({
  basePath: "/docs",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ameliorate.app",
        port: "",
      },
    ],
  },
});
