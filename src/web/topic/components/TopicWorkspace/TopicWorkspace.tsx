import { Global } from "@emotion/react";
import { Box, useMediaQuery } from "@mui/material";

import { ContextMenu } from "../../../common/components/ContextMenu/ContextMenu";
import {
  useActiveArguedDiagramPart,
  useActiveTableProblemNode,
  useViewingExploreDiagram,
} from "../../../view/navigateStore";
import { CriteriaTable } from "../CriteriaTable/CriteriaTable";
import { ClaimTree } from "../Diagram/ClaimTree";
import { ExploreDiagram } from "../Diagram/ExploreDiagram";
import { TopicDiagram } from "../Diagram/TopicDiagram";
import { TopicToolbar } from "../Surface/TopicToolbar";
import { TopicPane } from "../TopicPane/TopicPane";

export const TopicWorkspace = () => {
  const isLandscape = useMediaQuery("(orientation: landscape)");

  const viewingExploreDiagram = useViewingExploreDiagram();
  const tableProblemNode = useActiveTableProblemNode();
  const arguedDiagramPart = useActiveArguedDiagramPart();

  return (
    <>
      <TopicToolbar />

      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "auto",
          flexDirection: isLandscape ? "row" : "column-reverse",
        }}
      >
        <TopicPane isLandscape={isLandscape} />

        <Box height="100%" flex="1" position="relative">
          <Box width="100%" height="100%" position="absolute">
            <>
              {tableProblemNode && <CriteriaTable problemNodeId={tableProblemNode.id} />}
              {viewingExploreDiagram && <ExploreDiagram />}
              <TopicDiagram />
            </>
          </Box>

          {arguedDiagramPart && (
            // Criteria Table has header (z-index:2); expectation: overlay the component
            <Box width="100%" height="100%" position="absolute" zIndex="2">
              <ClaimTree arguedDiagramPartId={arguedDiagramPart.id} />
            </Box>
          )}
        </Box>

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </Box>

      <ContextMenu />
    </>
  );
};
