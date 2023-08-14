import { Global } from "@emotion/react";
import { Box } from "@mui/material";

import { ContextMenu } from "../../../common/components/ContextMenu/ContextMenu";
import { useActiveClaimDiagramId, useActiveTableProblemId } from "../../store/store";
import { problemDiagramId } from "../../utils/diagram";
import { CriteriaTable } from "../CriteriaTable/CriteriaTable";
import { Diagram } from "../Diagram/Diagram";
import { TopicPane } from "../Surface/TopicPane";
import { TopicToolbar } from "../Surface/TopicToolbar";
import { WorkspaceBox, workspaceStyles } from "./TopicWorkspace.styles";

export const TopicWorkspace = () => {
  const tableProblemId = useActiveTableProblemId();
  const claimDiagramId = useActiveClaimDiagramId();

  return (
    <>
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

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={workspaceStyles} />
      </WorkspaceBox>

      <ContextMenu />
    </>
  );
};
