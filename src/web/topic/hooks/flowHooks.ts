import { type Viewport, useReactFlow, useStore } from "reactflow";

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
 * Returns method to update the viewport of the flow diagram.
 *
 * This is a hook because that's how reactflow exposes this data - presumably so
 * that the state can come from the nearest react flow provider.
 */
export const useViewportUpdater = () => {
  const { getViewport, setViewport } = useReactFlow();
  const viewportHeight = useStore((state) => state.height);
  const viewportWidth = useStore((state) => state.width);

  const moveViewportToIncludeNode = (node: Node) => {
    // This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is
    // very slow.
    const viewport = getViewport();
    const newViewport = getViewportToIncludeNode(node, viewport, viewportHeight, viewportWidth);

    setViewport(newViewport, { duration: 500 });
  };

  return { moveViewportToIncludeNode };
};
