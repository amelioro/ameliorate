import { MarkerType } from "reactflow";

import { RelationName, childNode, composedRelations, parentNode, shortcutRelations } from "./edge";
import { Orientation, layout } from "./layout";
import { NodeType, children, parents } from "./node";

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
    showing: boolean;
  };
  position: {
    x: number;
    y: number;
  };
  selected: boolean;
  type: NodeType;
}

interface BuildProps {
  id: string;
  label?: string;
  score?: Score;
  type: NodeType;
  diagramId: string;
}
export const buildNode = ({ id, label, score, type, diagramId }: BuildProps): Node => {
  const node = {
    id: id,
    data: {
      label: label ?? `text${id}`,
      score: score ?? ("-" as Score),
      diagramId: diagramId,
      showing: true,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    selected: false,
    type: type,
  };

  return node;
};

// assumes that we always want to point from child to parent
export const markerStart = { type: MarkerType.ArrowClosed, width: 30, height: 30 };

export interface Edge {
  id: string;
  data: {
    score: Score;
    diagramId: string;
    showing: boolean;
  };
  label: RelationName;
  markerStart: { type: MarkerType; width: number; height: number };
  source: string; // source === parent if arrows point from bottom to top
  target: string; // target === child if arrows point from bottom to top
  type: "ScoreEdge";
}

export const buildEdge = (
  newEdgeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relation: RelationName,
  diagramId: string
): Edge => {
  return {
    id: newEdgeId,
    data: {
      score: "-" as Score,
      diagramId: diagramId,
      showing: true,
    },
    label: relation,
    markerStart: markerStart,
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge" as const,
  };
};

export type ArguableType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
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

export const findArguable = (diagram: Diagram, arguableId: string, arguableType: ArguableType) => {
  return arguableType === "node" ? findNode(diagram, arguableId) : findEdge(diagram, arguableId);
};

export const getNodesComposedBy = (node: Node, diagram: Diagram) => {
  return composedRelations.flatMap((composedRelation) => {
    const composingEdges = diagram.edges.filter((edge) => {
      return edge.source === node.id && edge.label === composedRelation.name;
    });

    const potentialComposedNodes = composingEdges.map((edge) => findNode(diagram, edge.target));

    return potentialComposedNodes
      .filter((node) => node.type === composedRelation.child)
      .map((node) => node);
  });
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
const isEdgeAShortcut = (edge: Edge, diagram: Diagram) => {
  const edgeParent = parentNode(edge, diagram);
  const edgeChild = childNode(edge, diagram);

  return shortcutRelations.some((shortcutRelation) => {
    const edgeCouldBeAShortcut =
      edgeParent.type === shortcutRelation.relation.parent &&
      edgeChild.type === shortcutRelation.relation.child;

    if (!edgeCouldBeAShortcut) return false;

    const childrenOfParent = children(edgeParent, diagram);
    const parentsOfChild = parents(edgeChild, diagram);

    const detourNodeAsChild = childrenOfParent.find(
      (child) => child.type === shortcutRelation.detourNodeType
    );
    const detourNodeAsParent = parentsOfChild.find(
      (parent) => parent.type === shortcutRelation.detourNodeType
    );

    const detourNodeConnectsParentAndChild =
      detourNodeAsChild && detourNodeAsParent && detourNodeAsChild.data.showing;

    return detourNodeConnectsParentAndChild;
  });
};

export const filterHiddenComponents = (diagram: Diagram): Diagram => {
  const shownNodes = diagram.nodes.filter((node) => node.data.showing);
  const shownNodeIds = shownNodes.map((node) => node.id);

  const shownEdges = diagram.edges.filter((edge) => {
    if (!shownNodeIds.includes(edge.source) || !shownNodeIds.includes(edge.target)) return false;

    if (isEdgeAShortcut(edge, diagram)) return false;

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
