import { Stack } from "@mui/material";

import { ScoreEdge } from "@/web/topic/components/Edge/ScoreEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { useNode } from "@/web/topic/diagramStore/nodeHooks";
import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { Edge } from "@/web/topic/utils/graph";

interface Props {
  edge: Edge;
}

export const StandaloneEdge = ({ edge }: Props) => {
  const sourceNode = useNode(edge.sourceId);
  const targetNode = useNode(edge.targetId);

  if (!sourceNode || !targetNode) {
    return <p>Could not find edge data!</p>;
  }

  const edgeLayoutData: EdgeLayoutData = {
    sourcePoint: { x: nodeWidthPx / 2, y: 100 }, // center of node
    targetPoint: { x: nodeWidthPx / 2, y: 0 },
    bendPoints: [],
    labelPosition: undefined,
  };

  // TODO?: could consider flipping the edge if layout will flip it, but doesn't seem totally necessary
  return (
    <Stack>
      {/* z-index to ensure hanging node indicators don't fall behind the edge svg empty background */}
      <EditableNode node={targetNode} className="z-10" />
      <ScoreEdge edge={edge} edgeLayoutData={edgeLayoutData} inReactFlow={false} />
      <EditableNode node={sourceNode} className="z-10" />
    </Stack>
  );
};
