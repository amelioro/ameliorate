import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";

import { TopicWorkspace } from "../web/topic/components/TopicWorkspace/TopicWorkspace";
import { populateFromLocalStorage } from "../web/topic/store/loadActions";
import { HydrationContext } from "./_app.page";

// extract component so that it can use the store after hydration
const Page = () => {
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

const Solve: NextPage = () => {
  // required to prevent hydration mismatch with usage of zustand's persist middleware
  // see explanation in `useDiagramStoreAfterHydration`
  const [isHydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <HydrationContext.Provider value={isHydrated}>
      <Page />
    </HydrationContext.Provider>
  );
};

export default Solve;
