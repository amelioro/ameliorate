import { Global } from "@emotion/react";
import { Box } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import { createContext, useEffect, useState } from "react";

import { ContextMenu } from "../web/common/components/ContextMenu/ContextMenu";
import { CriteriaTable } from "../web/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "../web/topic/components/Diagram/Diagram";
import { TopicPane } from "../web/topic/components/Surface/TopicPane";
import { TopicToolbar } from "../web/topic/components/Surface/TopicToolbar";
import { useActiveClaimDiagramId, useActiveTableProblemId } from "../web/topic/store/store";
import { problemDiagramId } from "../web/topic/utils/diagram";
import { WorkspaceBox, workspaceStyles } from "./solve.styles";

export const HydrationContext = createContext(false);

// extract component so that it can use the store after hydration
const Page = () => {
  const tableProblemId = useActiveTableProblemId();
  const claimDiagramId = useActiveClaimDiagramId();

  return (
    <>
      <Head>
        <title>Solve problems | Ameliorate</title>
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
          // Criteria Table has header (z-index:2); expectation: overlay the component
          <Box width="100%" height="100%" position="absolute" zIndex="2">
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
