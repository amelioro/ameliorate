import { Box } from "@mui/material";

import { Node } from "../../utils/diagram";
import { NodeClaimIndicator } from "../ClaimIndicator/NodeClaimIndicator";
import { CriteriaIndicator } from "../CriteriaIndicator/CriteriaIndicator";
import { CriteriaTableIndicator } from "../CriteriaTableIndicator/CriteriaTableIndicator";
import { ScoreDial } from "../ScoreDial/ScoreDial";

export const NodeIndicatorGroup = ({ node }: { node: Node }) => {
  return (
    <Box display="flex" margin="2px">
      <CriteriaTableIndicator nodeId={node.id} diagramId={node.data.diagramId} />
      <CriteriaIndicator nodeId={node.id} diagramId={node.data.diagramId} />
      <NodeClaimIndicator node={node} />
      <ScoreDial arguableId={node.id} arguableType="node" score={node.data.score} />
    </Box>
  );
};
