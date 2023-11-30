import { Box } from "@mui/material";

import { Edge } from "../../utils/graph";
import { EdgeClaimIndicator } from "../Indicator/EdgeClaimIndicator";
import { Score } from "../Score/Score";

export const EdgeIndicatorGroup = ({ edge }: { edge: Edge }) => {
  return (
    <Box display="flex">
      <EdgeClaimIndicator edge={edge} />
      <Score graphPartId={edge.id} />
    </Box>
  );
};
