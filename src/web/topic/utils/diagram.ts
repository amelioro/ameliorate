import { DiagramType } from "../../../common/diagram";
import { errorWithData } from "../../../common/errorHandling";
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
