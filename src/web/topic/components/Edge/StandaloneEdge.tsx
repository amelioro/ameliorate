import { Stack } from "@mui/material";
import { Position } from "reactflow";

import { useIsGraphPartSelected } from "../../../view/navigateStore";
import { useNode } from "../../store/nodeHooks";
import { Edge } from "../../utils/graph";
import { EdgeProps } from "../Diagram/Diagram";
import { EditableNode } from "../Node/EditableNode";
import { nodeWidthPx } from "../Node/EditableNode.styles";
import { ScoreEdge } from "./ScoreEdge";

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
