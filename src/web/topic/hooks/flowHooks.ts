import {
  type Viewport,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
  useStore,
  useStoreApi,
} from "reactflow";
import { shallow } from "zustand/shallow";

import { nodeHeightPx, nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { PositionedNode } from "@/web/topic/utils/diagram";
import { Node } from "@/web/topic/utils/graph";

const getViewportToIncludeNode = (
  node: PositionedNode,
  viewport: Viewport,
  viewportHeight: number,
  viewportWidth: number,
): Viewport => {
  const distanceToKeepNodeInViewport = 100; //pixels

  const scaledDistanceToKeepNodeInViewport = distanceToKeepNodeInViewport * viewport.zoom;
  const scaledNodeX = node.position.x * viewport.zoom;
  const scaledNodeY = node.position.y * viewport.zoom;
  const scaledNodeWidth = nodeWidthPx * viewport.zoom;
  const scaledNodeHeight = nodeHeightPx * viewport.zoom;

  const viewportXForNodeWithinLeftBounds = scaledDistanceToKeepNodeInViewport - scaledNodeX;
  const viewportXForNodeWithinRightBounds =
    viewportWidth - scaledDistanceToKeepNodeInViewport - scaledNodeX - scaledNodeWidth;

  const newViewportX =
    viewport.x < viewportXForNodeWithinLeftBounds
      ? viewportXForNodeWithinLeftBounds
      : viewport.x > viewportXForNodeWithinRightBounds
        ? viewportXForNodeWithinRightBounds
        : viewport.x;

  const viewportYForNodeWithinTopBounds = scaledDistanceToKeepNodeInViewport - scaledNodeY;
  const viewportYForNodeWithinBottomBounds =
    viewportHeight - scaledDistanceToKeepNodeInViewport - scaledNodeY - scaledNodeHeight;

  const newViewportY =
    viewport.y < viewportYForNodeWithinTopBounds
      ? viewportYForNodeWithinTopBounds
      : viewport.y > viewportYForNodeWithinBottomBounds
        ? viewportYForNodeWithinBottomBounds
        : viewport.y;

  return { x: newViewportX, y: newViewportY, zoom: viewport.zoom };
};

export const panDirections = ["up", "down", "left", "right"] as const;
export type PanDirection = (typeof panDirections)[number];

/**
 * Returns methods to update the viewport of the flow diagram.
 *
 * This is a hook because that's how reactflow exposes this data - presumably so
 * that the state can come from the nearest react flow provider.
 */
export const useViewportUpdater = () => {
  const { getViewport, setViewport, zoomIn, zoomOut } = useReactFlow();
  const viewportHeight = useStore((state) => state.height);
  const viewportWidth = useStore((state) => state.width);
  const minZoom = useStore((state) => state.minZoom);

  /**
   * Can't just use reactflow's `fitView` because that uses nodes that are already rendered in
   * the flow; we want to be able to invoke this after a store action, which means we may not have
   * re-rendered the flow yet.
   */
  const fitViewForNodes = (nodes: PositionedNode[]) => {
    // roughly figured the code here by referencing the fitView implementation https://github.com/wbkd/react-flow/blob/9dba3c5e7fb0d7edb6a3015bf65282f7030ca929/packages/core/src/store/utils.ts#L128
    const rect = getRectOfNodes(nodes);
    const adjustedRect = {
      ...rect,
      // Matches flow's built-in `fitView`, except it might be off a few px because flow's built-in
      // `fitView` uses the nodes' rendered heights, which are different if 2-3 lines of text.
      // Width/height adjustment is needed likely because nodes are positioned based on their upper-left corner?
      width: rect.width + nodeWidthPx,
      height: rect.height + nodeHeightPx,
    };

    const transform = getTransformForBounds(
      adjustedRect,
      viewportWidth,
      viewportHeight,
      minZoom,
      1,
    );

    const viewport = { x: transform[0], y: transform[1], zoom: transform[2] };
    setViewport(viewport);
  };

  const moveViewportToIncludeNode = (node: PositionedNode) => {
    // This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is very slow.
    const viewport = getViewport();
    const newViewport = getViewportToIncludeNode(node, viewport, viewportHeight, viewportWidth);

    setViewport(newViewport, { duration: 500 });
  };

  const pan = (direction: PanDirection) => {
    // This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is very slow.
    const viewport = getViewport();
    const panAmount = 20; // pixels - arbitrary amount that seems to work well
    const newViewport = {
      ...viewport,
      x:
        direction === "left"
          ? viewport.x + panAmount
          : direction === "right"
            ? viewport.x - panAmount
            : viewport.x,
      y:
        direction === "up"
          ? viewport.y + panAmount
          : direction === "down"
            ? viewport.y - panAmount
            : viewport.y,
    };
    setViewport(newViewport);
  };

  return { fitViewForNodes, moveViewportToIncludeNode, pan, zoomIn, zoomOut };
};

/**
 * Returns the zoom level of the flow diagram.
 *
 * This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is very
 * slow. It's still a hook though because that's how reactflow exposes this data - presumably so
 * that the state can come from the nearest react flow provider.
 */
export const useFlowZoom = () => {
  // expect to error if we aren't within react-flow, e.g. in the criteria table
  try {
    // found by referring to useViewport code https://github.com/wbkd/react-flow/blob/6d9585c1a62bf549298c83ad5f2dcd6216a5b8eb/packages/core/src/hooks/useViewport.ts
    const transform = useStoreApi().getState().transform;
    return transform[2];
  } catch {
    return 1;
  }
};

/**
 * Used to find nodes that are currently being hidden.
 */
export const useHiddenNodes = (nodes: Node[]) => {
  return useStore((state) => {
    const displayingNodes = Array.from(state.nodeInternals.values());
    return nodes.filter((node) => !displayingNodes.some((displaying) => displaying.id === node.id));
  }, shallow);
};
