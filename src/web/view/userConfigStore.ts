import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserConfigStoreState {
  showIndicators: boolean;
  fillNodesWithColor: boolean;
  indicateWhenNodeForcedToShow: boolean;
  expandDetailsTabs: boolean;
}

const initialState: UserConfigStoreState = {
  showIndicators: false,
  fillNodesWithColor: false,
  indicateWhenNodeForcedToShow: false,
  expandDetailsTabs: false,
};

const useUserConfigStore = create<UserConfigStoreState>()(
  persist(() => initialState, {
    name: "user-config-storage",
  }),
);

// hooks
export const useShowIndicators = () => {
  return useUserConfigStore((state) => state.showIndicators);
};

export const useFillNodesWithColor = () => {
  return useUserConfigStore((state) => state.fillNodesWithColor);
};

export const useIndicateWhenNodeForcedToShow = () => {
  return useUserConfigStore((state) => state.indicateWhenNodeForcedToShow);
};

export const useExpandDetailsTabs = () => {
  return useUserConfigStore((state) => state.expandDetailsTabs);
};

// actions
export const toggleShowIndicators = () => {
  useUserConfigStore.setState((state) => ({ showIndicators: !state.showIndicators }));
};

export const toggleFillNodesWithColor = (fill: boolean) => {
  useUserConfigStore.setState({ fillNodesWithColor: fill });
};

export const toggleIndicateWhenNodeForcedToShow = (indicate: boolean) => {
  useUserConfigStore.setState({ indicateWhenNodeForcedToShow: indicate });
};

export const toggleExpandDetailsTabs = () => {
  useUserConfigStore.setState((state) => ({ expandDetailsTabs: !state.expandDetailsTabs }));
};
