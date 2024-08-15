import { useCurrentViewStore } from "@/web/view/currentViewStore/store";

// hooks
export const useForceNodesIntoLayers = () => {
  return useCurrentViewStore((state) => state.forceNodesIntoLayers);
};

export const useLayerNodeIslandsTogether = () => {
  return useCurrentViewStore((state) => state.layerNodeIslandsTogether);
};

export const useLayoutThoroughness = () => {
  return useCurrentViewStore((state) => state.layoutThoroughness);
};

// actions
export const toggleForceNodesIntoLayers = (force: boolean) => {
  useCurrentViewStore.setState({ forceNodesIntoLayers: force });
};

export const toggleLayerNodeIslandsTogether = (layer: boolean) => {
  useCurrentViewStore.setState({ layerNodeIslandsTogether: layer });
};

export const setLayoutThoroughness = (thoroughness: number) => {
  useCurrentViewStore.setState({ layoutThoroughness: thoroughness });
};
