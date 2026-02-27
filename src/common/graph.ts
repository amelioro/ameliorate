import { type MinimalEdge } from "@/common/edge";
import { type MinimalNode } from "@/common/node";

export interface MinimalGraph {
  nodes: MinimalNode[];
  edges: MinimalEdge[];
}
