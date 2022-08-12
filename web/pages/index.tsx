import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@mui/material";

const Home: NextPage = () => {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>ameliorate</title>
      </Head>

      <header>
        <nav>
          <Link href="/">
            <a>ameliorate</a>
          </Link>

          <div className="right">
            <Image src="/Search_Icon.svg" height={32} width={32} />
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
                <Image src="/GitHub-Mark-64px.png" height={32} width={32} />
              </a>
            </Link>
          </div>
        </nav>
      </header>

      <style jsx>{`
        nav {
          display: flex;
          align-items: center;
          padding: 10px;
          background-color: ${theme.palette.primary.main};
          border-bottom: solid gray;
        }

        nav a {
          display: flex;
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

export default Home;
