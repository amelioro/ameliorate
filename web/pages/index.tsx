import { useTheme } from "@mui/material";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const theme = useTheme();

  return (
    <>
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
