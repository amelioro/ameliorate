import { Global } from "@emotion/react";
import { Box } from "@mui/material";

import { ContextMenu } from "../../../common/components/ContextMenu/ContextMenu";
import { useActiveClaimTreeId, useActiveTableProblemId } from "../../store/store";
import { topicDiagramId } from "../../utils/diagram";
import { CriteriaTable } from "../CriteriaTable/CriteriaTable";
import { Diagram } from "../Diagram/Diagram";
import { TopicDrawer } from "../Surface/TopicDrawer";
import { TopicToolbar } from "../Surface/TopicToolbar";

export const TopicWorkspace = () => {
  const tableProblemId = useActiveTableProblemId();
  const claimTreeId = useActiveClaimTreeId();

  return (
    <>
      <TopicToolbar />

      <Box sx={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        <TopicDrawer />

        <Box height="100%" flex="1" position="relative">
          <Box width="100%" height="100%" position="absolute">
            {tableProblemId ? (
              <CriteriaTable problemNodeId={tableProblemId} />
            ) : (
              <Diagram diagramId={topicDiagramId} />
            )}
          </Box>

          {claimTreeId && (
            // Criteria Table has header (z-index:2); expectation: overlay the component
            <Box width="100%" height="100%" position="absolute" zIndex="2">
              <Diagram diagramId={claimTreeId} />
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
