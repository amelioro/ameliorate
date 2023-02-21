import { Box } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import { createContext, useEffect, useState } from "react";

import { ContextMenu } from "../common/components/Menu/Menu";
import { CriteriaTable } from "../modules/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "../modules/topic/components/Diagram/Diagram";
import { TopicPane } from "../modules/topic/components/TopicPane/TopicPane";
import { TopicToolbar } from "../modules/topic/components/TopicToolbar/TopicToolbar";
import {
  problemDiagramId,
  useActiveClaimDiagramId,
  useActiveTableProblemId,
} from "../modules/topic/store/store";

export const HydrationContext = createContext(false);

// extract component so that it can use the store after hydration
const Page = () => {
  const tableProblemId = useActiveTableProblemId();
  const claimDiagramId = useActiveClaimDiagramId();

  return (
    <>
      <Head>
        <title>solve problems | ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool that makes it easier to solve tough problems. It helps you reason around hard decisions, and enables that reasoning to be shared and improved. Create your own problem map, and start solving today."
        />
      </Head>

      <TopicToolbar />
      <Box flex={1}>
        <TopicPane />
        {/* how to get these diagrams to use different flow instances? i.e. independent saved viewport values */}
        {claimDiagramId ? (
          <Diagram diagramId={claimDiagramId} />
        ) : tableProblemId ? (
          <CriteriaTable problemNodeId={tableProblemId} />
        ) : (
          <Diagram diagramId={problemDiagramId} />
        )}
      </Box>

      <ContextMenu />
    </>
  );
};

const Home: NextPage = () => {
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

export default Home;
