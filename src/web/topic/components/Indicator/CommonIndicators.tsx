import { Stack } from "@mui/material";
import { memo, useContext } from "react";

import { ContextIndicator } from "@/web/topic/components/Indicator/ContextIndicator";
import { CriteriaTableIndicator } from "@/web/topic/components/Indicator/CriteriaTableIndicator";
import { DetailsIndicator } from "@/web/topic/components/Indicator/DetailsIndicator";
import { Score } from "@/web/topic/components/Score/Score";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { GraphPart } from "@/web/topic/utils/graph";
import { useZenMode } from "@/web/view/userConfigStore";

interface Props {
  graphPart: GraphPart;
  notes: string;
}

const CommonIndicatorsBase = ({ graphPart, notes }: Props) => {
  const zenMode = useZenMode();
  const workspaceContext = useContext(WorkspaceContext);

  return (
    <Stack direction="row" margin="2px" spacing="2px">
      {!zenMode && (
        <>
          {/* TODO: should this be moved because it's not used for all graph parts? */}
          <ContextIndicator graphPart={graphPart} />
          {/* TODO: should this be moved because it's only used for problem? */}
          <CriteriaTableIndicator nodeId={graphPart.id} />
          <DetailsIndicator graphPartId={graphPart.id} notes={notes} />
        </>
      )}

      {/* table's purpose is mainly for scores, so show scores there even if in zen mode */}
      {(!zenMode || workspaceContext === "table") && <Score graphPartId={graphPart.id} />}
    </Stack>
  );
};

export const CommonIndicators = memo(CommonIndicatorsBase);
