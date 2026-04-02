import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  basePath: "/blog",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ameliorate.app" },
      { protocol: "https", hostname: "substackcdn.com" },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/user-attachments/assets/**",
      },
    ],
  },
});
