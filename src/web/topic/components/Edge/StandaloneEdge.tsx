import { Stack } from "@mui/material";
import { Position } from "reactflow";

import { EdgeProps } from "@/web/topic/components/Diagram/Diagram";
import { ScoreEdge } from "@/web/topic/components/Edge/ScoreEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { useNode } from "@/web/topic/store/nodeHooks";
import { Edge } from "@/web/topic/utils/graph";
import { useIsGraphPartSelected } from "@/web/view/currentViewStore/store";

const convertToStandaloneFlowEdge = (edge: Edge, selected: boolean): EdgeProps => {
  return {
    id: edge.id,
    data: edge.data,
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
      <EditableNode node={sourceNode} supplemental />
      <ScoreEdge inReactFlow={false} {...flowEdge} />
      <EditableNode node={targetNode} supplemental />
    </Stack>
  );
};
