import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  basePath: "/docs", // bit annoying, but seems like this is needed in order to proxy the main app url/docs to here https://answers.netlify.com/t/support-guide-can-i-deploy-multiple-repositories-in-a-single-site/179
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ameliorate.app",
        port: "",
      },
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/amelioro/ameliorate/assets/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/user-attachments/assets/**",
      },
    ],
  },
});
