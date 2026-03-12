import { Typography } from "@mui/material";
import { lowerCase } from "es-toolkit";

import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { Edge } from "@/web/topic/components/Edge/Edge";
import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { type IndirectEdge as IndirectEdgeData } from "@/web/topic/utils/indirectEdges";

interface Props {
  edge: IndirectEdgeData;
  edgeLayoutData: EdgeLayoutData;
  inReactFlow: boolean;
}

export const IndirectEdge = ({ edge, edgeLayoutData, inReactFlow }: Props) => {
  const labelText = lowerCase(edge.type);

  const labelContentSlot = (
    <Typography variant="body1" margin="0">
      {labelText}
    </Typography>
  );

  return (
    <Edge
      edge={edge}
      edgeLayoutData={edgeLayoutData}
      labelContentSlot={labelContentSlot}
      onContextMenu={(event) => openContextMenu(event, { calculatedEdge: edge })}
      inReactFlow={inReactFlow}
      pathClassName="[stroke-dasharray:5,5]"
    />
  );
};
