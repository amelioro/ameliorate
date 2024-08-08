import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourStoreState {
  hasSeenAnyTour: boolean;
}

const initialState: TourStoreState = {
  hasSeenAnyTour: false,
};

const useTourStore = create<TourStoreState>()(
  persist(() => initialState, {
    name: "tour-storage",
  }),
);

// hooks
export const useHasSeenAnyTour = () => {
  return useTourStore((state) => state.hasSeenAnyTour);
};

// actions
export const setHasSeenAnyTour = () => {
  useTourStore.setState({ hasSeenAnyTour: true });
};
