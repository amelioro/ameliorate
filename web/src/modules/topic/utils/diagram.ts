import { layout } from "./layout";
import { NodeType } from "./nodes";

export type NodeRelation = "Parent" | "Child";

interface BuildProps {
  id: string;
  type: NodeType;
  diagramId: string;
}
export const buildNode = ({ id, type, diagramId }: BuildProps) => {
  return {
    id: id,
    data: {
      label: `text${id}`,
      score: "-" as Score,
      width: 300,
      diagramId: diagramId,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    selected: false,
    type: type,
  };
};
export type Node = ReturnType<typeof buildNode>;

export const buildEdge = (newEdgeId: string, sourceNodeId: string, targetNodeId: string) => {
  return {
    id: newEdgeId,
    data: {
      score: "-" as Score,
    },
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge",
  };
};
export type Edge = ReturnType<typeof buildEdge>;

export const getInitialNodes = (startingNodeType: NodeType, diagramId: string) => {
  const { layoutedNodes: initialNodes } = layout(
    [buildNode({ id: "0", type: startingNodeType, diagramId: diagramId })],
    [],
    "TB"
  );

  return initialNodes;
};

export type ComponentType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Score = typeof possibleScores[number];
