// eslint-disable-next-line import/default -- idk still works
import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
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
