import { Metadata } from "next";
import Image from "next/image";
import PlausibleProvider from "next-plausible";
import { Anchor, Head, Search } from "nextra/components";
import { DiscordIcon, GitHubIcon } from "nextra/icons";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style-prefixed.css";
import "./custom.css";
import { ReactNode } from "react";

import { discordInvite, docsPage, githubRepo } from "../../src/web/common/urls";

const faviconIco = "https://ameliorate.app/favicon.ico";
// Image doesn't work with .ico
const faviconPng = "https://ameliorate.app/favicon.png";

export const metadata: Metadata = {
  title: {
    default: "Blog | Ameliorate",
    template: "%s | Ameliorate Blog",
  },
};

const navbarLinkClassName =
  "x:text-sm x:contrast-more:text-gray-700 x:contrast-more:dark:text-gray-100 x:whitespace-nowrap " +
  "x:text-gray-600 x:hover:text-gray-800 x:dark:text-gray-400 x:dark:hover:text-gray-200 " +
  "x:ring-inset x:transition-colors";

// Navbar children render after the search box but before the hamburger, and
// projectLink/chatLink would render before any children — so to get the order
// [search, nav link, github, discord] we render the icons inside `children` too.
const navbar = (
  <Navbar
    logo={
      <div className="x:flex x:items-center x:gap-2">
        <Image src={faviconPng} alt="home" height={32} width={32} />
        <span className="x:text-xl x:font-medium">Ameliorate</span>
      </div>
    }
    logoLink="https://ameliorate.app"
  >
    <a href={docsPage} className={navbarLinkClassName}>
      Docs
    </a>
    {/* Use nextra's `Anchor` for external icon links (rather than `<a>`) so we get the same
        focus-visible ring, target="_blank", and rel="noreferrer" that nextra applies to its
        own navbar `projectLink`/`chatLink` icons. */}
    <Anchor href={githubRepo}>
      <GitHubIcon height="24" />
    </Anchor>
    <Anchor href={discordInvite}>
      <DiscordIcon width="24" />
    </Anchor>
  </Navbar>
);

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href={faviconIco} />
      </Head>

      <body>
        <PlausibleProvider domain="ameliorate.app">
          <Layout
            search={<Search placeholder="Search blog..." />}
            navbar={navbar}
            pageMap={await getPageMap()}
            docsRepositoryBase="https://github.com/amelioro/ameliorate/blob/main/blog-site"
            editLink={null}
            sidebar={{ defaultMenuCollapseLevel: 99 }}
            toc={{ backToTop: <>Scroll to top</> }}
          >
            {children}
          </Layout>
        </PlausibleProvider>
      </body>
    </html>
  );
}
