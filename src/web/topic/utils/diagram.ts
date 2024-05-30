import { Edge, Node } from "@/web/topic/utils/graph";

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
