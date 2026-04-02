import { Metadata } from "next";
import Image from "next/image";
import PlausibleProvider from "next-plausible";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style-prefixed.css";
import "./custom.css";
import { ReactNode } from "react";

import { discordInvite, docsPage, githubRepo } from "../../src/web/common/urls";

const faviconIco = "https://ameliorate.app/favicon.ico";
const faviconPng = "https://ameliorate.app/favicon.png";

export const metadata: Metadata = {
  title: {
    default: "Blog | Ameliorate",
    template: "%s | Ameliorate Blog",
  },
};

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
  >
    <a href={docsPage}>Docs</a>
    <a href="/blog">Blog</a>
  </Navbar>
);

const footer = (
  <Footer>
    <a href="/blog/rss.xml">RSS</a>
  </Footer>
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
            navbar={navbar}
            pageMap={await getPageMap()}
            // No search widget for blog
            search={null}
            // No "Edit this page" for blog
            editLink={null}
            // "Question? Give us feedback" — same form as docs
            feedback={{
              content: "Question? Give us feedback",
              labels: "feedback",
            }}
            sidebar={{ defaultMenuCollapseLevel: 99 }}
            copyPageButton={false}
            footer={footer}
            toc={{ backToTop: <>Scroll to top</> }}
          >
            {children}
          </Layout>
        </PlausibleProvider>
      </body>
    </html>
  );
}
