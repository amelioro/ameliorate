const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

// eslint-disable-next-line functional/immutable-data -- when trying to use ESM, nextra encounters error "The requested module 'remark-reading-time' does not provide an export named 'default'"
module.exports = withNextra({
  basePath: "/docs", // bit annoying, but seems like this is needed in order to proxy the main app url/docs to here https://answers.netlify.com/t/support-guide-can-i-deploy-multiple-repositories-in-a-single-site/179
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
