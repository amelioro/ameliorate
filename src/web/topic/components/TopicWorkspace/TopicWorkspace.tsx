import { Global } from "@emotion/react";
import { Box, useMediaQuery } from "@mui/material";

import { ContextMenu } from "../../../common/components/ContextMenu/ContextMenu";
import {
  useActiveArguedDiagramPart,
  useActiveTableProblemNode,
  useActiveView,
  useSecondaryView,
} from "../../../view/navigateStore";
import { CriteriaTable } from "../CriteriaTable/CriteriaTable";
import { ClaimTree } from "../Diagram/ClaimTree";
import { ExploreDiagram } from "../Diagram/ExploreDiagram";
import { TopicDiagram } from "../Diagram/TopicDiagram";
import { TopicToolbar } from "../Surface/TopicToolbar";
import { TopicPane } from "../TopicPane/TopicPane";

export const TopicWorkspace = () => {
  const isLandscape = useMediaQuery("(orientation: landscape)");

  const activeView = useActiveView();
  const secondaryView = useSecondaryView();
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
          <Box
            width="100%"
            height="100%"
            position="absolute"
            zIndex={activeView === "criteriaTable" ? 2 : secondaryView === "criteriaTable" ? 1 : 0}
          >
            {tableProblemNode && <CriteriaTable problemNodeId={tableProblemNode.id} />}
          </Box>

          <Box
            width="100%"
            height="100%"
            position="absolute"
            zIndex={
              activeView === "exploreDiagram" ? 2 : secondaryView === "exploreDiagram" ? 1 : 0
            }
            sx={{ backgroundColor: "white" }} // diagrams default to transparent background specifically to allow claim tree to retain visual context of the view behind it
          >
            <ExploreDiagram />
          </Box>

          <Box
            width="100%"
            height="100%"
            position="absolute"
            zIndex={activeView === "topicDiagram" ? 2 : secondaryView === "topicDiagram" ? 1 : 0}
            sx={{ backgroundColor: "white" }} // diagrams default to transparent background specifically to allow claim tree to retain visual context of the view behind it
          >
            <TopicDiagram />
          </Box>

          <Box
            width="100%"
            height="100%"
            position="absolute"
            zIndex={activeView === "claimTree" ? 2 : 0}
          >
            {arguedDiagramPart && <ClaimTree arguedDiagramPartId={arguedDiagramPart.id} />}
          </Box>
        </Box>

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </Box>

      <ContextMenu />
    </>
  );
};
