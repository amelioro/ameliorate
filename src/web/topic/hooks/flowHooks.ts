import {
  type Viewport,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
  useStore,
  useStoreApi,
} from "reactflow";

import { nodeHeightPx, nodeWidthPx } from "../components/Node/EditableNode.styles";
import { PositionedNode } from "../utils/diagram";

const getViewportToIncludeNode = (
  node: PositionedNode,
  viewport: Viewport,
  viewportHeight: number,
  viewportWidth: number
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

/**
 * Returns methods to update the viewport of the flow diagram.
 *
 * This is a hook because that's how reactflow exposes this data - presumably so
 * that the state can come from the nearest react flow provider.
 */
export const useViewportUpdater = () => {
  const { getViewport, setViewport } = useReactFlow();
  const viewportHeight = useStore((state) => state.height);
  const viewportWidth = useStore((state) => state.width);
  const minZoom = useStore((state) => state.minZoom);

  const moveViewportToIncludeNode = (node: PositionedNode) => {
    // This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is
    // very slow.
    const viewport = getViewport();
    const newViewport = getViewportToIncludeNode(node, viewport, viewportHeight, viewportWidth);

    setViewport(newViewport, { duration: 500 });
  };

  /**
   * Can't just use reactflow's `fitView` because that uses nodes that are already rendered in
   * the flow; we want to be able to invoke this after a store action, which means we may not have
   * re-rendered the flow yet.
   */
  const fitViewForNodes = (nodes: PositionedNode[]) => {
    // roughly figured the code here by referencing the fitView implementation https://github.com/wbkd/react-flow/blob/9dba3c5e7fb0d7edb6a3015bf65282f7030ca929/packages/core/src/store/utils.ts#L128
    const rect = getRectOfNodes(nodes);
    const transform = getTransformForBounds(rect, viewportWidth, viewportHeight, minZoom, 1);
    const viewport = { x: transform[0], y: transform[1], zoom: transform[2] };
    setViewport(viewport);
  };

  return { fitViewForNodes, moveViewportToIncludeNode };
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
