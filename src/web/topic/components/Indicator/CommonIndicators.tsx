import { Stack } from "@mui/material";
import { memo } from "react";

import { CriteriaTableIndicator } from "@/web/topic/components/Indicator/CriteriaTableIndicator";
import { DetailsIndicator } from "@/web/topic/components/Indicator/DetailsIndicator";
import { Score } from "@/web/topic/components/Score/Score";

interface Props {
  graphPartId: string;
  notes: string;
}

const CommonIndicatorsBase = ({ graphPartId, notes }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px">
      {/* TODO: should this be moved because it's only used for problem? */}
      <CriteriaTableIndicator nodeId={graphPartId} />
      <DetailsIndicator graphPartId={graphPartId} notes={notes} />
      <Score graphPartId={graphPartId} />
    </Stack>
  );
};

export const CommonIndicators = memo(CommonIndicatorsBase);
