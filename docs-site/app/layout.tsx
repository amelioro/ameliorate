import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PlausibleProvider from "next-plausible";
import { Banner, Head, Search } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style-prefixed.css";
import { ReactNode } from "react";

import { discordInvite, githubRepo } from "../../src/web/common/urls";

const faviconIco = "https://ameliorate.app/favicon.ico";
// Image doesn't work with .ico
const faviconPng = "https://ameliorate.app/favicon.png";

export const metadata: Metadata = {
  title: {
    default: "Ameliorate",
    template: "%s | Ameliorate",
  },
};

const banner = (
  <Banner storageKey="banner-alpha-status">
    While Ameliorate is in{" "}
    <Link
      href="/release-status"
      // not sure why this isn't applied to banner, but just took these classes from a link generated from an mdx file
      className="x:focus-visible:nextra-focus x:text-primary-600 x:underline x:hover:no-underline x:decoration-from-font x:[text-underline-position:from-font]"
    >
      Alpha
    </Link>
    , it's expected to change a lot; feel free to{" "}
    <Link
      href="https://docs.google.com/forms/d/e/1FAIpQLSe6_7AulrnZuOEV4amXApJs0ohW1Dd-51_no9eAq-MVcHDm1w/viewform"
      target="_blank"
      // not sure why this isn't applied to banner, but just took these classes from a link generated from an mdx file
      className="x:focus-visible:nextra-focus x:text-primary-600 x:underline x:hover:no-underline x:decoration-from-font x:[text-underline-position:from-font]"
    >
      mention
    </Link>{" "}
    out-of-date docs, or ideas for improvement
  </Banner>
);
const navbar = (
  <Navbar
    logo={
      <div className="x:flex x:items-center x:gap-2">
        <Image src={faviconPng} alt="home" height={32} width={32} />
        <span className="x:text-xl x:font-medium">Ameliorate</span>
      </div>
    }
    logoLink="https://ameliorate.app"
    projectLink={githubRepo}
    chatLink={discordInvite}
  />
);

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" href={faviconIco} />
      </Head>
      <body>
        <PlausibleProvider domain="ameliorate.app">
          <Layout
            banner={banner}
            search={<Search />}
            navbar={navbar}
            pageMap={await getPageMap()}
            docsRepositoryBase="https://github.com/amelioro/ameliorate/blob/main/docs-site"
            editLink="Edit this page on GitHub"
            // I guess it's preferred to have menus collapsed by default now, since the nextra 4
            // functionality on menus is to open/close them (previously it would only do this if the
            // menu was already selected, which does seem more intuitive...).
            sidebar={{ defaultMenuCollapseLevel: 1 }}
            footer={<></>}
            toc={{ backToTop: <>Scroll to top</> }}
          >
            {children}
          </Layout>
        </PlausibleProvider>
      </body>
    </html>
  );
}
