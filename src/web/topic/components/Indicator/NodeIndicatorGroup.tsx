import { Box } from "@mui/material";

import { Node } from "../../utils/graph";
import { CriteriaTableIndicator } from "../Indicator/CriteriaTableIndicator";
import { NodeClaimIndicator } from "../Indicator/NodeClaimIndicator";
import { Score } from "../Score/Score";

export const NodeIndicatorGroup = ({ node }: { node: Node }) => {
  return (
    <Box display="flex" margin="2px">
      <CriteriaTableIndicator nodeId={node.id} />
      <NodeClaimIndicator node={node} />
      <Score graphPartId={node.id} />
    </Box>
  );
};
