import { type Viewport, useReactFlow, useStore, useStoreApi } from "reactflow";

import { nodeHeightPx, nodeWidthPx } from "../components/Node/EditableNode.styles";
import { Node } from "../utils/diagram";

const getViewportToIncludeNode = (
  node: Node,
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
 * Returns the viewport of the flow diagram.
 *
 * This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is very
 * slow. It's still a hook though because that's how reactflow exposes this data - presumably so
 * that the state can come from the nearest react flow provider.
 */
const useViewportNonReactive = (): Viewport => {
  // found by referring to useViewport code https://github.com/wbkd/react-flow/blob/6d9585c1a62bf549298c83ad5f2dcd6216a5b8eb/packages/core/src/hooks/useViewport.ts
  const transform = useStoreApi().getState().transform;
  return {
    x: transform[0],
    y: transform[1],
    zoom: transform[2],
  };
};

export const useViewportUpdater = () => {
  const { setViewport } = useReactFlow();
  const viewport = useViewportNonReactive();
  const viewportHeight = useStore((state) => state.height);
  const viewportWidth = useStore((state) => state.width);

  const moveViewportToIncludeNode = (node: Node) => {
    const newViewport = getViewportToIncludeNode(node, viewport, viewportHeight, viewportWidth);

    setViewport(newViewport, { duration: 500 });
  };

  return { moveViewportToIncludeNode };
};
