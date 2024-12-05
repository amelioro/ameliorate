import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserConfigStoreState {
  zenMode: boolean;
  fillNodesWithColor: boolean;
  indicateWhenNodeForcedToShow: boolean;
}

const initialState: UserConfigStoreState = {
  zenMode: false,
  fillNodesWithColor: false,
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

export const toggleIndicateWhenNodeForcedToShow = (indicate: boolean) => {
  useUserConfigStore.setState({ indicateWhenNodeForcedToShow: indicate });
};
