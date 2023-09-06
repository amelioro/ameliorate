import { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";

import { TopicWorkspace } from "../web/topic/components/TopicWorkspace/TopicWorkspace";
import { populateFromLocalStorage } from "../web/topic/store/loadActions";
import { playgroundUsername } from "../web/topic/store/store";
import { setPerspectives } from "../web/view/store/store";

// TODO: add save button to playground
const Playground: NextPage = () => {
  // must hydrate store after page is rendered, otherwise if hydration starts before page finishes
  // rendering, there will be a render mismatch between client and server
  useEffect(() => {
    const populate = async () => {
      await populateFromLocalStorage();
    };
    void populate();
    setPerspectives([playgroundUsername]);
  }, []);

  return (
    <>
      <Head>
        <title>Solve problems | Ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool that makes it easier to solve tough problems. It helps you reason around hard decisions, and enables that reasoning to be shared and improved. Create your own problem map, and start solving today."
        />
      </Head>

      <TopicWorkspace />
    </>
  );
};

export default Playground;
