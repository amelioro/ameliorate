import { Box } from "@mui/material";

import { Edge } from "../../utils/diagram";
import { EdgeClaimIndicator } from "../Indicator/EdgeClaimIndicator";
import { ScoreDial } from "../ScoreDial/ScoreDial";

export const EdgeIndicatorGroup = ({ edge }: { edge: Edge }) => {
  return (
    <Box display="flex">
      <EdgeClaimIndicator edge={edge} />
      <ScoreDial arguableId={edge.id} arguableType="edge" score={edge.data.score} />
    </Box>
  );
};