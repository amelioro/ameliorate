import { type Edge as ReactFlowEdge } from "@xyflow/react";

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
}

export interface PositionedEdge
  extends Edge,
    Required<Pick<ReactFlowEdge, "sourceHandle" | "targetHandle">> {
  data: Edge["data"] & Omit<LayoutedEdge, "id" | "sourcePortId" | "targetPortId">; // edge already has id directly on it
}

export interface PositionedDiagram extends Diagram {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}
