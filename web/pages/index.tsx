import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ameliorate</title>
        <meta name="description" content="Solve problems" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <Link href="/">
            <a>
              <Image src="/favicon.ico" height={32} width={32} />
            </a>
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
          background-color: cyan;
          border-bottom: solid gray;
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
