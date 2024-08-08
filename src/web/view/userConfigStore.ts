import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserConfigStoreState {
  fillNodesWithColor: boolean;
  indicateWhenNodeForcedToShow: boolean;
}

const initialState: UserConfigStoreState = {
  fillNodesWithColor: false,
  indicateWhenNodeForcedToShow: false,
};

const useUserConfigStore = create<UserConfigStoreState>()(
  persist(() => initialState, {
    name: "user-config-storage",
  }),
);

// hooks
export const useFillNodesWithColor = () => {
  return useUserConfigStore((state) => state.fillNodesWithColor);
};

export const useIndicateWhenNodeForcedToShow = () => {
  return useUserConfigStore((state) => state.indicateWhenNodeForcedToShow);
};

// actions
export const toggleFillNodesWithColor = (fill: boolean) => {
  useUserConfigStore.setState({ fillNodesWithColor: fill });
};

export const toggleIndicateWhenNodeForcedToShow = (indicate: boolean) => {
  useUserConfigStore.setState({ indicateWhenNodeForcedToShow: indicate });
};
