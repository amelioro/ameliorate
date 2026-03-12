import { useState } from "react";

import { FilteredDiagram } from "@/web/topic/utils/diagramFilter";
import { LayoutedGraph, layout } from "@/web/topic/utils/layout";
import {
  useAvoidEdgeLabelOverlap,
  useForceNodesIntoLayers,
  useLayerNodeIslandsTogether,
  useLayoutThoroughness,
  useMinimizeEdgeCrossings,
} from "@/web/view/currentViewStore/layout";

// re-renders when diagram changes, but only re-layouts if graph parts are added or removed
export const useLayoutedDiagram = (diagram: FilteredDiagram) => {
  const forceNodesIntoLayers = useForceNodesIntoLayers();
  const layerNodeIslandsTogether = useLayerNodeIslandsTogether();
  const minimizeEdgeCrossings = useMinimizeEdgeCrossings();
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();
  const thoroughness = useLayoutThoroughness();

  // re-layout if this changes
  const diagramHash = [
    // not 100% sure that it's worth re-laying out when node text changes, but we can easily remove if it doesn't seem like it
    ...diagram.nodes.map((node) => node.id + node.data.text + node.type),
    ...diagram.edges.map((edge) => edge.id + edge.type),
    String(forceNodesIntoLayers),
    String(layerNodeIslandsTogether),
    String(minimizeEdgeCrossings),
    String(avoidEdgeLabelOverlap),
    String(thoroughness),
  ].join();
  const [prevDiagramHash, setPrevDiagramHash] = useState<string | null>(null);

  const [layoutedDiagram, setLayoutedDiagram] = useState<LayoutedGraph | null>(null);
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

      setLayoutedDiagram(newLayoutedDiagram);
      setHasNewLayout(true);
    };
    void layoutDiagram();
  }

  // if we're waiting for the first layout to complete
  if (!layoutedDiagram) return { layoutedDiagram: null, hasNewLayout, setHasNewLayout };

  return { layoutedDiagram, hasNewLayout, setHasNewLayout };
};
