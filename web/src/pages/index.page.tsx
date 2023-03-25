import { Global } from "@emotion/react";
import { Box } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import { createContext, useEffect, useState } from "react";

import { ContextMenu } from "../common/components/ContextMenu/ContextMenu";
import { CriteriaTable } from "../modules/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "../modules/topic/components/Diagram/Diagram";
import { TopicPane } from "../modules/topic/components/Surface/TopicPane";
import { TopicToolbar } from "../modules/topic/components/Surface/TopicToolbar";
import {
  problemDiagramId,
  useActiveClaimDiagramId,
  useActiveTableProblemId,
} from "../modules/topic/store/store";
import { WorkspaceBox, workspaceStyles } from "./index.styles";

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

      <WorkspaceBox>
        <TopicPane />

        <Box width="100%" height="100%" position="absolute">
          {tableProblemId ? (
            <CriteriaTable problemNodeId={tableProblemId} />
          ) : (
            <Diagram diagramId={problemDiagramId} />
          )}
        </Box>

        {claimDiagramId && (
          <Box width="100%" height="100%" position="absolute">
            <Diagram diagramId={claimDiagramId} />
          </Box>
        )}
        {/* prevents body scrolling when  workspace is rendered*/}
        <Global styles={workspaceStyles} />
      </WorkspaceBox>

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
