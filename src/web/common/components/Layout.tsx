import { NextPage } from "next";
import { Roboto } from "next/font/google";
import { ReactNode } from "react";

import { Header } from "@/web/common/components/Header";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

interface LayoutProps {
  children: ReactNode;
}

const Layout: NextPage<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />

      {/* self-host font to prevent layout shift from fallback fonts loading first, see https://nextjs.org/docs/pages/building-your-application/optimizing/fonts */}
      <main className={roboto.className}>{children}</main>
    </>
  );
};

export default Layout;
