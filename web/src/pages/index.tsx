import { Box } from "@mui/material";
import { NextPage } from "next";
import { createContext, useEffect, useState } from "react";

import { Diagram } from "../modules/topic/components/Diagram/Diagram";
import { TopicPane } from "../modules/topic/components/TopicPane/TopicPane";

export const HydrationContext = createContext(false);

const Home: NextPage = () => {
  // required to prevent hydration mismatch with usage of zustand's persist middleware
  // see explanation in `useDiagramStoreAfterHydration`
  const [isHydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <HydrationContext.Provider value={isHydrated}>
      <Box width="100%" height="100%">
        <TopicPane />
        <Diagram />
      </Box>
    </HydrationContext.Provider>
  );
};

export default Home;
