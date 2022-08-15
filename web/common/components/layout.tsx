import { useTheme } from "@mui/material";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const Layout: NextPage<Props> = ({ children }) => {
  const theme = useTheme();

  return (
    <>
      <header>
        <nav>
          <Link href="/">
            <a>ameliorate</a>
          </Link>

          <div className="right">
            <Image src="/Search_Icon.svg" height={32} width={32} alt="search" />
            <Link href="/new">
              <a>create understanding</a>
            </Link>
            <Link href="/mine">
              <a>my understandings</a>
            </Link>
            <Link href="/about">
              <a>about</a>
            </Link>
            <Link href="/login">
              <a>login</a>
            </Link>
            <Link href="https://github.com/keyserj/ameliorate">
              <a>
                <Image
                  src="/GitHub-Mark-64px.png"
                  height={32}
                  width={32}
                  alt="github link"
                />
              </a>
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <style jsx>{`
        nav {
          display: flex;
          align-items: center;
          padding: 10px;
          background-color: ${theme.palette.primary.main};
          border-bottom: solid ${theme.palette.divider};
        }

        nav a {
          display: flex;
          color: ${theme.palette.primary.contrastText};
        }

        .right {
          display: flex;
          align-items: center;
          margin-left: auto;
          gap: 15px;
        }
      `}</style>
    </>
  );
};

export default Layout;
