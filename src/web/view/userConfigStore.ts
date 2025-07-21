import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserConfigStoreState {
  zenMode: boolean;
  fillNodesWithColor: boolean;
  expandDetailsTabs: boolean;
  /**
   * When true, show score pies by hovering rather than just via click. Can be nice to score many
   * nodes quickly on desktop. Don't want this on all the time because it's pretty annoying for
   * pies to show when you're not intending to set scores.
   */
  quickScoring: boolean;

  showScores: boolean;
  showContentIndicators: boolean;
  showNeighborIndicators: boolean;
  showViewIndicators: boolean;
  indicateWhenNodeForcedToShow: boolean; // legacy name, could rename to `showForceShownIndicators`
}

const initialState: UserConfigStoreState = {
  zenMode: false,
  fillNodesWithColor: false,
  expandDetailsTabs: true,
  quickScoring: false,

  showScores: true,
  showContentIndicators: true,
  showNeighborIndicators: false,
  showViewIndicators: false,
  indicateWhenNodeForcedToShow: false,
};

const useUserConfigStore = create<UserConfigStoreState>()(
  persist(() => initialState, {
    name: "user-config-storage",
  }),
);

// hooks
export const useZenMode = () => {
  return useUserConfigStore((state) => state.zenMode);
};

export const useFillNodesWithColor = () => {
  return useUserConfigStore((state) => state.fillNodesWithColor);
};

export const useExpandDetailsTabs = () => {
  return useUserConfigStore((state) => state.expandDetailsTabs);
};

export const useQuickScoring = () => {
  return useUserConfigStore((state) => state.quickScoring);
};

export const useShowScores = () => {
  return useUserConfigStore((state) => state.showScores);
};

export const useShowContentIndicators = () => {
  return useUserConfigStore((state) => state.showContentIndicators);
};

export const useShowNeighborIndicators = () => {
  return useUserConfigStore((state) => state.showNeighborIndicators);
};

export const useShowViewIndicators = () => {
  return useUserConfigStore((state) => state.showViewIndicators);
};

export const useIndicateWhenNodeForcedToShow = () => {
  return useUserConfigStore((state) => state.indicateWhenNodeForcedToShow);
};

// actions
export const toggleZenMode = () => {
  useUserConfigStore.setState((state) => ({ zenMode: !state.zenMode }));
};

export const toggleFillNodesWithColor = (fill: boolean) => {
  useUserConfigStore.setState({ fillNodesWithColor: fill });
};

export const toggleExpandDetailsTabs = () => {
  useUserConfigStore.setState((state) => ({ expandDetailsTabs: !state.expandDetailsTabs }));
};

export const toggleQuickScoring = () => {
  useUserConfigStore.setState((state) => ({ quickScoring: !state.quickScoring }));
};

export const toggleShowScores = () => {
  useUserConfigStore.setState((state) => ({ showScores: !state.showScores }));
};

export const toggleShowContentIndicators = () => {
  useUserConfigStore.setState((state) => ({ showContentIndicators: !state.showContentIndicators }));
};

export const toggleShowNeighborIndicators = () => {
  useUserConfigStore.setState((state) => ({
    showNeighborIndicators: !state.showNeighborIndicators,
  }));
};

export const toggleShowViewIndicators = () => {
  useUserConfigStore.setState((state) => ({ showViewIndicators: !state.showViewIndicators }));
};

export const toggleIndicateWhenNodeForcedToShow = () => {
  useUserConfigStore.setState((state) => ({
    indicateWhenNodeForcedToShow: !state.indicateWhenNodeForcedToShow,
  }));
};
