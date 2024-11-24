import { Edge, Node } from "@/web/topic/utils/graph";
import { LayoutedEdge } from "@/web/topic/utils/layout";

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

export interface PositionedEdge extends Edge {
  data: Edge["data"] & Omit<LayoutedEdge, "id">; // edge already has id directly on it
  selected: boolean;
}

export interface PositionedDiagram extends Diagram {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}
