import { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import Image from "next/image";
import Link from "next/link";
import { Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head, Search } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style-prefixed.css";
import { ReactNode } from "react";

import { discordInvite, feedbackPage, githubRepo } from "../../src/web/common/urls";

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
      href="https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#providing-feedback"
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
// const footer = (
//   <Footer className="flex-col items-center md:items-start">
//     MIT {new Date().getFullYear()} © Nextra.
//   </Footer>
// );

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
      <Head
      // backgroundColor={{
      //   dark: "rgb(15, 23, 42)",
      //   light: "rgb(254, 252, 232)",
      // }}
      // color={{
      //   hue: { dark: 120, light: 0 },
      //   saturation: { dark: 100, light: 100 },
      // }}
      >
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
            sidebar={{ defaultMenuCollapseLevel: 1 }}
            // footer={footer}
            footer={<></>}
            feedback={{ content: <Link href={feedbackPage}>Question? Give us feedback</Link> }}
            toc={{ backToTop: <>Scroll to top</> }}
          >
            {children}
          </Layout>
        </PlausibleProvider>
      </body>
    </html>
  );
}
