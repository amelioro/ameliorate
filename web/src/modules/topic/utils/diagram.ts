import { MarkerType } from "reactflow";

import { RelationName, childNode, parentNode } from "./edge";
import { Orientation, layout } from "./layout";
import { NodeType, children, onlyParent } from "./nodes";

export type DiagramType = "problem" | "claim";
export type RelationDirection = "parent" | "child";

export const orientations: Record<DiagramType, Orientation> = {
  problem: "TB",
  claim: "LR",
};

export interface Diagram {
  id: string;
  nodes: Node[];
  edges: Edge[];
  type: DiagramType;
}

export interface Node {
  id: string;
  data: {
    label: string;
    score: Score;
    diagramId: string;
  };
  position: {
    x: number;
    y: number;
  };
  selected: boolean;
  type: NodeType;
}
export type ProblemNode = Node & { data: { showCriteria: boolean } };

interface BuildProps {
  id: string;
  label?: string;
  score?: Score;
  type: NodeType;
  diagramId: string;
}
export const buildNode = ({ id, label, score, type, diagramId }: BuildProps) => {
  const node = {
    id: id,
    data: {
      label: label ?? `text${id}`,
      score: score ?? ("-" as Score),
      diagramId: diagramId,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    selected: false,
    type: type,
  };

  if (type === "problem") {
    return { ...node, data: { ...node.data, showCriteria: true } } as ProblemNode;
  } else {
    return node as Node;
  }
};

export interface Edge {
  id: string;
  data: {
    score: Score;
  };
  label: RelationName;
  markerStart: { type: MarkerType; width: number; height: number };
  source: string;
  target: string;
  type: "ScoreEdge";
}

export const buildEdge = (
  newEdgeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relation: RelationName
): Edge => {
  return {
    id: newEdgeId,
    data: {
      score: "-" as Score,
    },
    label: relation,
    // assumes that we always want to point from child to parent
    markerStart: { type: MarkerType.ArrowClosed, width: 30, height: 30 },
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge" as const,
  };
};

export type ScorableType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Score = typeof possibleScores[number];

export const findNode = (diagram: Diagram, nodeId: string) => {
  const node = diagram.nodes.find((node) => node.id === nodeId);
  if (!node) throw new Error("node not found");

  return node;
};

export const findEdge = (diagram: Diagram, edgeId: string) => {
  const edge = diagram.edges.find((edge) => edge.id === edgeId);
  if (!edge) throw new Error("edge not found");

  return edge;
};

export const findScorable = (diagram: Diagram, scorableId: string, scorableType: ScorableType) => {
  return scorableType === "node" ? findNode(diagram, scorableId) : findEdge(diagram, scorableId);
};

export const filterHiddenComponents = (diagram: Diagram): Diagram => {
  const shownNodes = diagram.nodes.filter((node) => {
    if (node.type !== "criterion") {
      return true;
    }

    const problemParent = onlyParent(node, diagram) as ProblemNode;
    return problemParent.data.showCriteria;
  });
  const shownNodeIds = shownNodes.map((node) => node.id);

  const shownEdges = diagram.edges.filter((edge) => {
    if (!shownNodeIds.includes(edge.source) || !shownNodeIds.includes(edge.target)) return false;

    const edgeParent = parentNode(edge, diagram);
    const edgeChild = childNode(edge, diagram);

    if (edgeParent.type !== "problem") return true;
    const problemParent = edgeParent as ProblemNode;

    const problemChildren = children(problemParent, diagram);
    const problemHasCriteria = problemChildren.some((child) => child.type === "criterion");

    // hide solution connections if showing criteria because criteria imply a connection to solution
    if (problemParent.data.showCriteria && problemHasCriteria && edgeChild.type === "solution") {
      return false;
    }

    return true;
  });

  return { ...diagram, nodes: shownNodes, edges: shownEdges };
};

export const layoutVisibleComponents = (diagram: Diagram) => {
  // filter
  const displayDiagram = filterHiddenComponents(diagram);

  // layout only the displayed components
  const { layoutedNodes } = layout(
    displayDiagram.nodes,
    displayDiagram.edges,
    orientations[diagram.type]
  );

  // update positions of displayed components
  const updatedNodes = diagram.nodes.map((node) => {
    const layoutedNode = layoutedNodes.find((layoutedNode) => layoutedNode.id === node.id);
    if (!layoutedNode) return node;

    return { ...node, position: layoutedNode.position };
  });

  // return both displayed and hidden components
  return { ...diagram, nodes: updatedNodes, edges: diagram.edges };
};
