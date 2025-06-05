import { Stack } from "@mui/material";
import { Position } from "reactflow";

import { EdgeProps } from "@/web/topic/components/Diagram/Diagram";
import { ScoreEdge } from "@/web/topic/components/Edge/ScoreEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { useNode } from "@/web/topic/diagramStore/nodeHooks";
import { Edge } from "@/web/topic/utils/graph";
import { useIsGraphPartSelected } from "@/web/view/selectedPartStore";

const convertToStandaloneFlowEdge = (edge: Edge, selected: boolean): EdgeProps => {
  return {
    id: edge.id,
    // don't provide a position for the label, so it defaults to being placed between the two nodes
    data: { ...edge.data, elkSections: [] },
    label: edge.label,
    selected: selected,
    source: edge.source,
    target: edge.target,

    sourceX: nodeWidthPx / 2, // center of node
    sourceY: 0,
    sourcePosition: Position.Top,
    targetX: nodeWidthPx / 2,
    targetY: 100,
    targetPosition: Position.Bottom,
  };
};

interface Props {
  edge: Edge;
}

export const StandaloneEdge = ({ edge }: Props) => {
  const sourceNode = useNode(edge.source);
  const targetNode = useNode(edge.target);
  const isEdgeSelected = useIsGraphPartSelected(edge.id);

  if (!sourceNode || !targetNode) {
    return <p>Could not find edge data!</p>;
  }

  const flowEdge = convertToStandaloneFlowEdge(edge, isEdgeSelected);

  return (
    <Stack>
      {/* z-index to ensure hanging node indicators don't fall behind the edge svg empty background */}
      <EditableNode node={sourceNode} className="z-10" />
      <ScoreEdge inReactFlow={false} {...flowEdge} />
      <EditableNode node={targetNode} className="z-10" />
    </Stack>
  );
};
