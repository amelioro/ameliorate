import { Stack } from "@mui/material";
import { Position } from "reactflow";

import { useNode } from "../../store/nodeHooks";
import { Edge } from "../../utils/graph";
import { EdgeProps } from "../Diagram/Diagram";
import { EditableNode } from "../Node/EditableNode";
import { nodeWidthPx } from "../Node/EditableNode.styles";
import { ScoreEdge, svgMarkerDefId } from "./ScoreEdge";

const convertToStandaloneFlowEdge = (edge: Edge): EdgeProps => {
  return {
    id: edge.id,
    data: edge.data,
    label: edge.label,
    selected: edge.selected,
    source: edge.source,
    target: edge.target,

    sourceX: nodeWidthPx / 2, // center of node
    sourceY: 0,
    sourcePosition: Position.Top,
    targetX: nodeWidthPx / 2,
    targetY: 100,
    targetPosition: Position.Bottom,

    markerStart: `url(#${svgMarkerDefId})`,
  };
};

interface Props {
  edge: Edge;
}

export const StandaloneEdge = ({ edge }: Props) => {
  const sourceNode = useNode(edge.source);
  const targetNode = useNode(edge.target);

  if (!sourceNode || !targetNode) {
    return <p>Could not find edge data!</p>;
  }

  const flowEdge = convertToStandaloneFlowEdge(edge);

  return (
    <Stack>
      <EditableNode node={sourceNode} supplemental />
      <ScoreEdge inReactFlow={false} {...flowEdge} />
      <EditableNode node={targetNode} supplemental />
    </Stack>
  );
};
