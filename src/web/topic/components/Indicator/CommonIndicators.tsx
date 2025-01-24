import { Stack } from "@mui/material";
import { memo } from "react";

import { ContextIndicator } from "@/web/topic/components/Indicator/ContextIndicator";
import { CriteriaTableIndicator } from "@/web/topic/components/Indicator/CriteriaTableIndicator";
import { Score } from "@/web/topic/components/Score/Score";
import { GraphPart } from "@/web/topic/utils/graph";

interface Props {
  graphPart: GraphPart;
  className?: string;
}

const CommonIndicatorsBase = ({ graphPart, className }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      {/* TODO: should this be moved because it's not used for all graph parts? */}
      <ContextIndicator graphPart={graphPart} />
      {/* TODO: should this be moved because it's only used for problem? */}
      <CriteriaTableIndicator nodeId={graphPart.id} />
      <Score graphPartId={graphPart.id} />
    </Stack>
  );
};

export const CommonIndicators = memo(CommonIndicatorsBase);
