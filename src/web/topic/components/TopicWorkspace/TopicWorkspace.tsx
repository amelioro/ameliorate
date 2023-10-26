import { Global } from "@emotion/react";
import { Box, useMediaQuery } from "@mui/material";

import { ContextMenu } from "../../../common/components/ContextMenu/ContextMenu";
import { useActiveArguedDiagramPart, useActiveTableProblemNode } from "../../store/store";
import { topicDiagramId } from "../../utils/diagram";
import { CriteriaTable } from "../CriteriaTable/CriteriaTable";
import { Diagram } from "../Diagram/Diagram";
import { TopicDrawer } from "../Surface/TopicDrawer";
import { TopicToolbar } from "../Surface/TopicToolbar";

export const TopicWorkspace = () => {
  const isLandscape = useMediaQuery("(orientation: landscape)");

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
          flexDirection: isLandscape ? "row" : "column-reverse",
        }}
      >
        <TopicDrawer isLandscape={isLandscape} />

        <Box height="100%" flex="1" position="relative">
          <Box width="100%" height="100%" position="absolute">
            {tableProblemNode ? (
              <CriteriaTable problemNodeId={tableProblemNode.id} />
            ) : (
              <Diagram diagramId={topicDiagramId} />
            )}
          </Box>

          {arguedDiagramPart && (
            // Criteria Table has header (z-index:2); expectation: overlay the component
            <Box width="100%" height="100%" position="absolute" zIndex="2">
              <Diagram diagramId={arguedDiagramPart.id} />
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
