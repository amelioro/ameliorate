import { useState } from "react";

import { Diagram, PositionedDiagram, PositionedNode } from "@/web/topic/utils/diagram";
import { NodePosition, layout } from "@/web/topic/utils/layout";
import {
  useForceNodesIntoLayers,
  useLayerNodeIslandsTogether,
  useLayoutThoroughness,
  useMinimizeEdgeCrossings,
} from "@/web/view/currentViewStore/layout";
import { useSelectedGraphPart } from "@/web/view/currentViewStore/store";

// re-renders when diagram changes, but only re-layouts if graph parts are added or removed
export const useLayoutedDiagram = (diagram: Diagram) => {
  const forceNodesIntoLayers = useForceNodesIntoLayers();
  const layerNodeIslandsTogether = useLayerNodeIslandsTogether();
  const minimizeEdgeCrossings = useMinimizeEdgeCrossings();
  const thoroughness = useLayoutThoroughness();

  // re-layout if this changes
  const diagramHash = [...diagram.nodes, ...diagram.edges]
    .map((graphPart) => graphPart.id)
    .concat(
      String(forceNodesIntoLayers),
      String(layerNodeIslandsTogether),
      String(minimizeEdgeCrossings),
      String(thoroughness),
    )
    .join();
  const [prevDiagramHash, setPrevDiagramHash] = useState<string | null>(null);

  const [layoutedNodes, setLayoutedNodes] = useState<NodePosition[] | null>(null);
  const [hasNewLayout, setHasNewLayout] = useState<boolean>(false);

  const selectedGraphPart = useSelectedGraphPart();

  if (diagramHash !== prevDiagramHash) {
    setPrevDiagramHash(diagramHash);

    const layoutDiagram = async () => {
      const newLayoutedNodes = await layout(
        diagram,
        forceNodesIntoLayers,
        layerNodeIslandsTogether,
        minimizeEdgeCrossings,
        thoroughness,
      );
      setLayoutedNodes(newLayoutedNodes);
      setHasNewLayout(true);
    };
    void layoutDiagram();
  }

  if (!layoutedNodes) return { layoutedDiagram: null, hasNewLayout, setHasNewLayout };

  const layoutedDiagram: PositionedDiagram = {
    ...diagram,
    nodes: diagram.nodes
      .map((node) => {
        const layoutedNode = layoutedNodes.find((layoutedNode) => layoutedNode.id === node.id);
        if (!layoutedNode) return null;

        return {
          ...node,
          position: {
            x: layoutedNode.x,
            y: layoutedNode.y,
          },
          selected: node.id === selectedGraphPart?.id, // add selected here because react flow uses it (as opposed to our custom components, which can rely on selectedGraphPart hook independently)
        };
      })
      .filter((node): node is PositionedNode => node !== null),
    edges: diagram.edges.map((edge) => ({ ...edge, selected: edge.id === selectedGraphPart?.id })),
  };

  // loading a new diagram but layout hasn't finished yet
  if (diagram.nodes.length !== 0 && layoutedDiagram.nodes.length === 0)
    return { layoutedDiagram: null, hasNewLayout, setHasNewLayout };

  return { layoutedDiagram, hasNewLayout, setHasNewLayout };
};
