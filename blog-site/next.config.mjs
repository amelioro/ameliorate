import nextra from "nextra";
import rehypeUnwrapImages from "rehype-unwrap-images";

// Standalone images render through ImageWithCaption (see app/components/ImageWithCaption.tsx)
// as <figure>, which is invalid HTML inside a <p>. rehype-unwrap-images strips
// the surrounding paragraph for standalone images so the figure isn't nested.
const withNextra = nextra({
  mdxOptions: {
    rehypePlugins: [rehypeUnwrapImages],
  },
});

export default withNextra({
  basePath: "/blog", // bit annoying, but seems like this is needed in order to proxy the main app url/blog to here https://answers.netlify.com/t/support-guide-can-i-deploy-multiple-repositories-in-a-single-site/179
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
