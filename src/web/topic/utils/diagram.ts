import { Edge, Node } from "./graph";

export interface Diagram {
  nodes: Node[];
  edges: Edge[];
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
