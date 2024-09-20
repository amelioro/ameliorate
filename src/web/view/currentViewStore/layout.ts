import { emitter } from "@/web/common/event";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";

// hooks
export const useForceNodesIntoLayers = () => {
  return useCurrentViewStore((state) => state.forceNodesIntoLayers);
};

export const useLayerNodeIslandsTogether = () => {
  return useCurrentViewStore((state) => state.layerNodeIslandsTogether);
};

export const useMinimizeEdgeCrossings = () => {
  return useCurrentViewStore((state) => state.minimizeEdgeCrossings);
};

export const useLayoutThoroughness = () => {
  return useCurrentViewStore((state) => state.layoutThoroughness);
};

// actions
export const toggleForceNodesIntoLayers = (force: boolean) => {
  useCurrentViewStore.setState({ forceNodesIntoLayers: force });

  emitter.emit("changedLayoutConfig");
};

export const toggleLayerNodeIslandsTogether = (layer: boolean) => {
  useCurrentViewStore.setState({ layerNodeIslandsTogether: layer });

  emitter.emit("changedLayoutConfig");
};

export const toggleMinimizeEdgeCrossings = (minimize: boolean) => {
  useCurrentViewStore.setState({ minimizeEdgeCrossings: minimize });

  emitter.emit("changedLayoutConfig");
};

export const setLayoutThoroughness = (thoroughness: number) => {
  useCurrentViewStore.setState({ layoutThoroughness: thoroughness });

  emitter.emit("changedLayoutConfig");
};
