import { useTheme } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

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

      <div className="center">
        <section className="paper">
          <h2>No problem is too complex.</h2>
          <h2>Solving made possible. For anyone.</h2>
          <h2>Disagree based on values, not on miscommunication.</h2>
          <h2>Understand yourself. Understand each other. Grow together.</h2>

          <div className="split">
            <div>
              <h2>Hot</h2>
              <p>Racism</p>
              <p>School Shootings</p>
            </div>
            <div>
              <h2>New</h2>
              <p>Climate Change</p>
            </div>
            <div>
              <h2>Recently Visited</h2>
              <p>World Hunger</p>
              <p>School Shootings</p>
            </div>
          </div>
        </section>
      </div>

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

        .center {
          display: flex;
          justify-content: center;
        }

        .paper {
          background-color: ${theme.palette.background.paper};
          width: 1080px;
          margin: 10px;
          padding: 10px;
          text-align: center;
        }

        .split {
          display: flex;
          border-top: solid ${theme.palette.divider};
        }

        .split * {
          flex: 1 1 0px;
        }
      `}</style>
    </>
  );
};

export default Home;
