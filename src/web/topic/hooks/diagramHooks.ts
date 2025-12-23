import { useState } from "react";

import { Diagram, PositionedDiagram } from "@/web/topic/utils/diagram";
import { isNode } from "@/web/topic/utils/graph";
import { layout } from "@/web/topic/utils/layout";
import {
  useAvoidEdgeLabelOverlap,
  useForceNodesIntoLayers,
  useLayerNodeIslandsTogether,
  useLayoutThoroughness,
  useMinimizeEdgeCrossings,
} from "@/web/view/currentViewStore/layout";

// re-renders when diagram changes, but only re-layouts if graph parts are added or removed
export const usePositionedDiagram = (diagram: Diagram) => {
  const forceNodesIntoLayers = useForceNodesIntoLayers();
  const layerNodeIslandsTogether = useLayerNodeIslandsTogether();
  const minimizeEdgeCrossings = useMinimizeEdgeCrossings();
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();
  const thoroughness = useLayoutThoroughness();

  // re-layout if this changes
  const diagramHash = [...diagram.nodes, ...diagram.edges]
    // not 100% sure that it's worth re-laying out when node text changes, but we can easily remove if it doesn't seem like it
    .map((graphPart) =>
      isNode(graphPart)
        ? graphPart.id + graphPart.data.label + graphPart.type
        : graphPart.id + graphPart.label,
    )
    .concat(
      String(forceNodesIntoLayers),
      String(layerNodeIslandsTogether),
      String(minimizeEdgeCrossings),
      String(avoidEdgeLabelOverlap),
      String(thoroughness),
    )
    .join();
  const [prevDiagramHash, setPrevDiagramHash] = useState<string | null>(null);

  const [positionedDiagram, setPositionedDiagram] = useState<PositionedDiagram | null>(null);
  const [hasNewLayout, setHasNewLayout] = useState<boolean>(false);

  if (diagramHash !== prevDiagramHash) {
    setPrevDiagramHash(diagramHash);

    const layoutDiagram = async () => {
      // TODO?: could add `loadingLayout` state but it seems like most of the time taken is actually
      // elsewhere? so there's still a delay before showing a Loading indicator anyway
      const newLayoutedDiagram = await layout(
        diagram,
        forceNodesIntoLayers,
        layerNodeIslandsTogether,
        minimizeEdgeCrossings,
        avoidEdgeLabelOverlap,
        thoroughness,
      );

      const positionedDiagram: PositionedDiagram = {
        ...diagram,
        nodes: diagram.nodes
          .map((node) => {
            const layoutedNode = newLayoutedDiagram.layoutedNodes.find(
              (layoutedNode) => layoutedNode.id === node.id,
            );
            if (!layoutedNode) return null;

            return {
              ...node,
              data: { ...node.data, ports: layoutedNode.ports },
              position: {
                x: layoutedNode.x,
                y: layoutedNode.y,
              },
            };
          })
          .filter((node) => node !== null),
        edges: diagram.edges
          .map((edge) => {
            const layoutedEdge = newLayoutedDiagram.layoutedEdges.find(
              (layoutedEdge) => layoutedEdge.id === edge.id,
            );
            if (!layoutedEdge) return null;
            const { sourcePortId, targetPortId, elkLabel, elkSections } = layoutedEdge;

            return {
              ...edge,
              sourceHandle: sourcePortId,
              targetHandle: targetPortId,
              data: { ...edge.data, elkLabel, elkSections },
            };
          })
          .filter((edge) => edge !== null),
      };

      setPositionedDiagram(positionedDiagram);
      setHasNewLayout(true);
    };
    void layoutDiagram();
  }

  // if we're waiting for the first layout to complete
  if (!positionedDiagram) return { positionedDiagram: null, hasNewLayout, setHasNewLayout };

  return { positionedDiagram, hasNewLayout, setHasNewLayout };
};
