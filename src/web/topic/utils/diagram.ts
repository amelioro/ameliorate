import { type Edge, type Node } from "@/web/topic/utils/graph";
import { LayoutedEdge } from "@/web/topic/utils/layout";

export interface Diagram {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Used for rendering paths and labels. If we have ELK layout data, we should use that. Otherwise,
 * e.g. for StandaloneEdge outside of the diagram, we can set this ourselves.
 */
export type EdgeLayoutData = Pick<
  LayoutedEdge,
  "sourcePoint" | "targetPoint" | "bendPoints" | "labelPosition"
> & {
  /**
   * Determines how to adjust the edge centerpoint for each edge between the same two nodes such
   * that the edges don't follow identical paths.
   *
   * Ranges from -(numEdges/2) to +(numEdges/2), skipping 0 when numEdges is even. When 0 or
   * undefined, no offset is applied.
   *
   * E.g. 2 edges: [-1, 1]; 3 edges: [-1, 0, 1]; 4 edges: [-2, -1, 1, 2].
   *
   * TODO?: ideally we wouldn't need to do this edge offsetting ourselves and could just rely on ELK
   * to do it, but 1. we don't currently draw ELK beziers nicely (i.e. starting and ending going
   * vertically into the handles) and 2. I don't know how to get ELK to have paths avoid identically
   * overlapping each other without using positioned labels, which we also don't want to use because
   * they're treated as nodes and therefore create a bunch of extra layers in the layout.
   * Potentially we could allow ELK to choose ports for us, then each edge would have its own port
   * and that'd result in no identical paths, but using many ports makes edges look a bit more
   * chaotic, which seems like a tradeoff maybe not worth making.
   */
  parallelOffsetIndex?: number;
};
