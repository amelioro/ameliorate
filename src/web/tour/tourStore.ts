import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Tour } from "@/web/tour/tourUtils";

interface TourStoreState {
  hasSeenAnyTour: boolean;
  startedTours: Tour[];
  completedTours: Tour[];
}

const initialState: TourStoreState = {
  hasSeenAnyTour: false,
  startedTours: [],
  completedTours: [],
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

export const useTourProgress = () => {
  return useTourStore((state) => ({
    startedTours: state.startedTours,
    completedTours: state.completedTours,
  }));
};

// actions
export const setHasSeenAnyTour = () => {
  useTourStore.setState({ hasSeenAnyTour: true });
};

export const setTourHasStarted = (tour: Tour) => {
  const startedTours = useTourStore.getState().startedTours;

  if (startedTours.includes(tour)) return;

  useTourStore.setState({
    startedTours: [...startedTours, tour],
  });
};

export const setTourHasCompleted = (tour: Tour) => {
  const completedTours = useTourStore.getState().completedTours;

  if (completedTours.includes(tour)) return;

  useTourStore.setState({
    completedTours: [...completedTours, tour],
  });
};
