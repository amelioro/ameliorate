import Image from "next/image";
import Link from "next/link";
import { useConfig } from "nextra-theme-docs";

import { discordInvite, feedbackPage, githubRepo } from "../src/web/common/urls";

const faviconIco = "https://ameliorate.app/favicon.ico";
// Image doesn't work with .ico
const faviconPng = "https://ameliorate.app/favicon.png";

const config = {
  // links
  project: {
    link: githubRepo,
  },
  // TODO: Make this identical to the logo in the main app (i.e. add "Alpha", and "Ameliorate")
  logo: <Image src={faviconPng} height={32} width={32} alt="home" />,
  logoLink: "https://ameliorate.app",
  chat: {
    link: discordInvite,
  },
  docsRepositoryBase: "https://github.com/amelioro/ameliorate/blob/main/docs-site",
  feedback: {
    useLink: () => feedbackPage,
  },

  // other config
  banner: {
    content: (
      <>
        While Ameliorate is in{" "}
        <Link
          href="/release-status"
          // not sure why this isn't applied to banner, but just took these classes from a link generated from an mdx file
          className="_text-primary-600 underline _decoration-from-font [text-underline-position:from-font]"
        >
          Alpha
        </Link>
        , it's expected to change a lot; feel free to{" "}
        <Link
          href="https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#providing-feedback"
          target="_blank"
          // not sure why this isn't applied to banner, but just took these classes from a link generated from an mdx file
          className="_text-primary-600 underline _decoration-from-font [text-underline-position:from-font]"
        >
          mention
        </Link>{" "}
        out-of-date docs, or ideas for improvement
      </>
    ),
  },
  head: function Head() {
    const config = useConfig();
    const title = `${config.title} | Ameliorate`;

    return (
      <>
        <link rel="icon" href={faviconIco} />

        {/* https://mui.com/material-ui/getting-started/usage/#responsive-meta-tag */}
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>{title}</title>
      </>
    );
  },
  footer: { component: <></> },
  toc: {
    backToTop: <>Scroll to top</>,
  },
};

export default config;
