import { type EdgeProps } from "reactflow";

import { type Edge, type Node } from "@/web/topic/utils/graph";
import { type LayoutedEdge, type LayoutedNode } from "@/web/topic/utils/layout";

export interface Diagram {
  nodes: Node[];
  edges: Edge[];
}

export interface PositionedNode extends Node {
  data: Node["data"] & { ports: LayoutedNode["ports"] };
  position: {
    x: number;
    y: number;
  };
  selected: boolean;
}

export interface PositionedEdge extends Edge, Pick<EdgeProps, "sourceHandleId" | "targetHandleId"> {
  data: Edge["data"] & Omit<LayoutedEdge, "id">; // edge already has id directly on it
  selected: boolean;
}

export interface PositionedDiagram extends Diagram {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}
