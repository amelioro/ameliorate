import { Stack } from "@mui/material";
import { memo } from "react";

import { CriteriaTableIndicator } from "@/web/topic/components/Indicator/CriteriaTableIndicator";
import { DetailsIndicator } from "@/web/topic/components/Indicator/DetailsIndicator";
import { Score } from "@/web/topic/components/Score/Score";
import { GraphPart } from "@/web/topic/utils/graph";

interface Props {
  graphPart: GraphPart;
  notes: string;
}

const CommonIndicatorsBase = ({ graphPart, notes }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px">
      {/* TODO: should this be moved because it's only used for problem? */}
      <CriteriaTableIndicator nodeId={graphPart.id} />
      <DetailsIndicator graphPartId={graphPart.id} notes={notes} />
      <Score graphPartId={graphPart.id} />
    </Stack>
  );
};

export const CommonIndicators = memo(CommonIndicatorsBase);
