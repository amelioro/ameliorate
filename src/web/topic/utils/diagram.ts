import { DiagramType } from "../../../common/diagram";
import { errorWithData } from "../../../common/errorHandling";
import { isEdgeImplied } from "./edge";
import { Edge, Node } from "./graph";
import { Orientation } from "./layout";

export interface Diagram {
  nodes: Node[];
  edges: Edge[];
  orientation: Orientation;
  type: DiagramType;
}

export interface PositionedNode extends Node {
  position: {
    x: number;
    y: number;
  };
  selected: boolean;
}

export interface PositionedDiagram extends Diagram {
  nodes: PositionedNode[];
}

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
