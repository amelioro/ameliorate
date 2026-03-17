/**
 * React Flow's `useOnViewportChange` sets a single callback via `store.setState`, so multiple
 * calls overwrite each other. This store centralizes viewport-change tracking so that any
 * component (e.g. poppers anchored to edges/nodes) can react to panning/zooming without
 * competing for that single hook.
 */
import { create } from "zustand";

interface ViewportChangeStoreState {
  isChanging: boolean;
}

const initialState: ViewportChangeStoreState = {
  isChanging: false,
};

const useViewportChangeStore = create<ViewportChangeStoreState>()(() => initialState);

// hooks
export const useIsViewportChanging = () => useViewportChangeStore((state) => state.isChanging);

// actions
export const setViewportIsChanging = (isChanging: boolean) => {
  useViewportChangeStore.setState({ isChanging });
};
