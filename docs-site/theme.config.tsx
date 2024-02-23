import Image from "next/image";

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
  useNextSeoProps() {
    return { titleTemplate: "%s | Ameliorate" };
  },
  head: (
    <>
      <link rel="icon" href={faviconIco} />

      {/* https://mui.com/material-ui/getting-started/usage/#responsive-meta-tag */}
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </>
  ),
  footer: { component: <></> },
  toc: {
    backToTop: true,
  },
};

export default config;
