import { useState } from "react";

import {
  Diagram,
  PositionedDiagram,
  PositionedEdge,
  PositionedNode,
} from "@/web/topic/utils/diagram";
import { isNode } from "@/web/topic/utils/graph";
import { LayoutedGraph, layout } from "@/web/topic/utils/layout";
import {
  useAvoidEdgeLabelOverlap,
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
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();
  const thoroughness = useLayoutThoroughness();

  // re-layout if this changes
  const diagramHash = [...diagram.nodes, ...diagram.edges]
    // not 100% sure that it's worth re-laying out when node text changes, but we can easily remove if it doesn't seem like it
    .map((graphPart) => (isNode(graphPart) ? graphPart.id + graphPart.data.label : graphPart.id))
    .concat(
      String(forceNodesIntoLayers),
      String(layerNodeIslandsTogether),
      String(minimizeEdgeCrossings),
      String(avoidEdgeLabelOverlap),
      String(thoroughness),
    )
    .join();
  const [prevDiagramHash, setPrevDiagramHash] = useState<string | null>(null);

  const [layoutedGraph, setLayoutedGraph] = useState<LayoutedGraph | null>(null);
  const [hasNewLayout, setHasNewLayout] = useState<boolean>(false);

  const selectedGraphPart = useSelectedGraphPart();

  if (diagramHash !== prevDiagramHash) {
    setPrevDiagramHash(diagramHash);

    const layoutDiagram = async () => {
      const newLayoutedGraph = await layout(
        diagram,
        forceNodesIntoLayers,
        layerNodeIslandsTogether,
        minimizeEdgeCrossings,
        avoidEdgeLabelOverlap,
        thoroughness,
      );
      setLayoutedGraph(newLayoutedGraph);
      setHasNewLayout(true);
    };
    void layoutDiagram();
  }

  if (!layoutedGraph) return { layoutedDiagram: null, hasNewLayout, setHasNewLayout };

  const layoutedDiagram: PositionedDiagram = {
    ...diagram,
    nodes: diagram.nodes
      .map((node) => {
        const layoutedNode = layoutedGraph.layoutedNodes.find(
          (layoutedNode) => layoutedNode.id === node.id,
        );
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
    edges: diagram.edges
      .map((edge) => {
        const layoutedEdge = layoutedGraph.layoutedEdges.find(
          (layoutedEdge) => layoutedEdge.id === edge.id,
        );
        if (!layoutedEdge) return null;
        const { elkLabel, elkSections } = layoutedEdge;

        return {
          ...edge,
          data: { ...edge.data, elkLabel, elkSections },
          selected: edge.id === selectedGraphPart?.id, // add selected here because react flow uses it (as opposed to our custom components, which can rely on selectedGraphPart hook independently)
        } as PositionedEdge;
      })
      .filter((edge): edge is PositionedEdge => edge !== null),
  };

  // loading a new diagram but layout hasn't finished yet
  if (diagram.nodes.length !== 0 && layoutedDiagram.nodes.length === 0)
    return { layoutedDiagram: null, hasNewLayout, setHasNewLayout };

  return { layoutedDiagram, hasNewLayout, setHasNewLayout };
};
