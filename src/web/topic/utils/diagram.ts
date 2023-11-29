import { MarkerType } from "reactflow";
import { v4 as uuid } from "uuid";

import { RelationName } from "../../../common/edge";
import { errorWithData } from "../../../common/errorHandling";
import { composedRelations, isEdgeImplied } from "./edge";
import { Orientation } from "./layout";
import { FlowNodeType } from "./node";

export type RelationDirection = "parent" | "child";
export type DiagramType = "topicDiagram" | "claimTree";

export interface Diagram {
  nodes: Node[];
  edges: Edge[];
  orientation: Orientation;
  type: DiagramType;
}

export interface PositionedDiagram extends Diagram {
  nodes: PositionedNode[];
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  id: string;
  data: {
    label: string;
    notes: string;
    arguedDiagramPartId?: string;
    showing: boolean;
    newlyAdded: boolean; // jank to allow focusing nodes after adding them
  };
  selected: boolean;
  type: FlowNodeType;
}

export interface PositionedNode extends Node {
  position: {
    x: number;
    y: number;
  };
}

interface BuildProps {
  id?: string;
  label?: string;
  notes?: string;
  type: FlowNodeType;
  arguedDiagramPartId?: string;
}
export const buildNode = ({ id, label, notes, type, arguedDiagramPartId }: BuildProps): Node => {
  const node = {
    id: id ?? uuid(),
    data: {
      label: label ?? `new node`,
      notes: notes ?? "",
      arguedDiagramPartId: arguedDiagramPartId,
      showing: true,
      newlyAdded: false,
    },
    selected: false,
    type: type,
  };

  return node;
};

// assumes that we always want to point from child to parent
export const markerStart = { type: MarkerType.ArrowClosed, width: 30, height: 30 };

// TODO: add pointer to child claim tree & own diagram
// this will reduce a ton of extra calculation & param passing
export interface Edge {
  id: string;
  data: {
    arguedDiagramPartId?: string;
    notes: string;
  };
  label: RelationName;
  selected: boolean;
  markerStart: { type: MarkerType; width: number; height: number };
  source: string; // source === parent if arrows point from bottom to top
  target: string; // target === child if arrows point from bottom to top
  type: "FlowEdge";
}

interface BuildEdgeProps {
  id?: string;
  notes?: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: RelationName;
  arguedDiagramPartId?: string;
}
export const buildEdge = ({
  id,
  notes,
  sourceNodeId,
  targetNodeId,
  relation,
  arguedDiagramPartId,
}: BuildEdgeProps): Edge => {
  return {
    id: id ?? uuid(),
    data: {
      arguedDiagramPartId: arguedDiagramPartId,
      notes: notes ?? "",
    },
    label: relation,
    selected: false,
    markerStart: markerStart,
    source: sourceNodeId,
    target: targetNodeId,
    type: "FlowEdge" as const,
  };
};

export type GraphPart = Node | Edge;
export type GraphPartType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
export type Score = typeof possibleScores[number];

export const findNode = (nodeId: string, nodes: Node[]) => {
  const node = nodes.find((node) => node.id === nodeId);
  if (!node) throw errorWithData("node not found", nodeId, nodes);

  return node;
};

export const findEdge = (edgeId: string, edges: Edge[]) => {
  const edge = edges.find((edge) => edge.id === edgeId);
  if (!edge) throw errorWithData("edge not found", edgeId, edges);

  return edge;
};

export const findGraphPart = (graphPartId: string, nodes: Node[], edges: Edge[]) => {
  const graphPart = [...nodes, ...edges].find((graphPart) => graphPart.id === graphPartId);
  if (!graphPart) throw errorWithData("graph part not found", graphPartId, nodes, edges);

  return graphPart;
};

export const isNode = (graphPart: GraphPart): graphPart is Node => {
  if (graphPart.type !== "FlowEdge") return true;
  return false;
};

export const getNodesComposedBy = (node: Node, topicGraph: Graph) => {
  return composedRelations.flatMap((composedRelation) => {
    const composingEdges = topicGraph.edges.filter((edge) => {
      return edge.source === node.id && edge.label === composedRelation.name;
    });

    const potentialComposedNodes = composingEdges.map((edge) =>
      findNode(edge.target, topicGraph.nodes)
    );

    return potentialComposedNodes
      .filter((node) => node.type === composedRelation.child)
      .map((node) => node);
  });
};

export const getDiagramTitle = (diagram: Diagram) => {
  const rootNode = diagram.nodes[0];
  if (!rootNode) throw errorWithData("diagram has no root node", diagram);

  return rootNode.data.label;
};

/**
 * general philosophy on hiding components, to minimize confusion:
 * - do not automatically hide components that have already been shown, unless the user chooses to hide them
 * - always visually indicate hidden components some way
 * - always allow the user to explicitly show/hide components that can be hidden
 * - feel free to hide components when they're created if they're implied and have not been shown yet
 */
export const filterHiddenComponents = (
  diagram: Diagram,
  claimEdges: Edge[],
  showImpliedEdges: boolean
): Diagram => {
  const shownNodes = diagram.nodes.filter((node) => node.data.showing);
  const shownNodeIds = shownNodes.map((node) => node.id);

  const shownEdges = diagram.edges.filter((edge) => {
    if (!shownNodeIds.includes(edge.source) || !shownNodeIds.includes(edge.target)) return false;

    return true;
  });

  // edges are implied based on other shown nodes & edges, so filter those before filtering implied edges
  const shownEdgesAfterImpliedFilter = shownEdges.filter(
    (edge) =>
      showImpliedEdges ||
      !isEdgeImplied(edge, { ...diagram, nodes: shownNodes, edges: shownEdges }, claimEdges)
  );

  return { ...diagram, nodes: shownNodes, edges: shownEdgesAfterImpliedFilter };
};
