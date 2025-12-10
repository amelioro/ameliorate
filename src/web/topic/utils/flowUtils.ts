import { type Node as ReactFlowNode, getNodesBounds } from "@xyflow/react";

import { nodeHeightPx, nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";

/**
 * Match padding used by React Flow's fitView https://github.com/xyflow/xyflow/blob/ede221a7ad9555763edc2321033d3c3e61261da2/packages/system/src/utils/graph.ts#L375
 */
export const defaultFitViewPadding = 0.1;

/**
 * Nodes are positioned but not yet rendered
 */
export const getNotYetRenderedNodesBounds = (nodes: ReactFlowNode[]) => {
  /**
   * Our nodes won't be rendered yet so we need to provide an estimate of dimensions. This may
   * make the fit slightly inaccurate, e.g. if there are nodes with 2-3 lines of text they will be
   * taller. If this is a big problem, we could consider measuring node size via method similar/
   * exactly like we do for layout.
   *
   * TODO?: one of the usages happens after layout, and the other probably _could_ use layouted
   * nodes. Potentially we could store node dimensions on PositionedNode after layout and just use
   * those here.
   */
  const nodesWithDimensions = nodes.map((node) => ({
    ...node,
    width: nodeWidthPx, // TODO?: probably hardcoded node sizes shouldn't be imported from a styles file
    height: nodeHeightPx,
  }));

  /**
   * Before reactflow 12, used getRectOfNodes for this, but unfortunately `getNodesBounds` (the
   * reactflow-recommened replacement) expects the passed-in nodes to have gone through reactflow
   * rendering already and therefore have internal state and/or be in the nodeLookup.
   *
   * Therefore, it throws a warning in dev if we don't pass nodeLookup. Unfortunately, passing
   * a nodeLookup requires matching nodes to the "node internals" structure, which has an absolute
   * position calculated, otherwise our nodes won't be found and a default 0-size will be used.
   * Logic lives here https://github.com/xyflow/xyflow/blob/ede221a7ad9555763edc2321033d3c3e61261da2/packages/system/src/utils/graph.ts#L195-L229.
   *
   * At least for now we can just not pass `nodeLookup`, specify our own node dimensions, then
   * the fitting should work fine.
   */
  return getNodesBounds(nodesWithDimensions);
};
