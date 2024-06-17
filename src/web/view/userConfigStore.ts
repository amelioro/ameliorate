import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserConfigStoreState {
  fillNodesWithColor: boolean;
}

const initialState: UserConfigStoreState = {
  fillNodesWithColor: false,
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

// actions
export const toggleFillNodesWithColor = (fill: boolean) => {
  useUserConfigStore.setState({ fillNodesWithColor: fill });
};
