import { Box } from "@mui/material";

import { Node } from "../../utils/diagram";
import { CriteriaIndicator } from "../Indicator/CriteriaIndicator";
import { CriteriaTableIndicator } from "../Indicator/CriteriaTableIndicator";
import { NodeClaimIndicator } from "../Indicator/NodeClaimIndicator";
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
