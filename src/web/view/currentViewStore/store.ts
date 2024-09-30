import Router from "next/router";
import { temporal } from "zundo";
import { useStore } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { Format, InfoCategory } from "@/common/infoCategory";
import { withDefaults } from "@/common/object";
import { emitter } from "@/web/common/event";
import { getGraphPart, useGraphPart } from "@/web/topic/store/graphPartHooks";
import { migrate } from "@/web/view/currentViewStore/migrate";
import { triggerEvent } from "@/web/view/currentViewStore/triggerEventMiddleware";
import {
  getDefaultQuickView,
  getQuickViewByTitle,
  selectViewFromState,
} from "@/web/view/quickViewStore/store";
import { StandardFilter } from "@/web/view/utils/diagramFilter";
import { GeneralFilter } from "@/web/view/utils/generalFilter";
import { TableFilter } from "@/web/view/utils/tableFilter";

export interface ViewState {
  selectedGraphPartId: string | null;
  format: Format;

  // info category state is flattened (rather than `[category]: state`) for ease of modifying
  categoriesToShow: InfoCategory[];
  breakdownFilter: StandardFilter;
  researchFilter: StandardFilter;
  justificationFilter: StandardFilter;

  tableFilter: TableFilter;
  generalFilter: GeneralFilter;

  // infrequent options
  showImpliedEdges: boolean;

  // layout
  forceNodesIntoLayers: boolean;
  layerNodeIslandsTogether: boolean;
  minimizeEdgeCrossings: boolean;
  layoutThoroughness: number;
}

export const initialViewState: ViewState = {
  selectedGraphPartId: null,
  format: "diagram",

  categoriesToShow: ["breakdown"],
  breakdownFilter: { type: "none" },
  researchFilter: { type: "none" },
  justificationFilter: { type: "none" },

  tableFilter: {
    solutions: [],
    criteria: [],
  },
  generalFilter: {
    nodeTypes: [],
    showOnlyScored: false,
    scoredComparer: "≥",
    scoreToCompare: "5",
    nodesToShow: [],
    nodesToHide: [],
    showSecondaryResearch: false,
    showSecondaryBreakdown: true,
  },

  showImpliedEdges: false,

  forceNodesIntoLayers: true,
  layerNodeIslandsTogether: false,
  minimizeEdgeCrossings: false,
  layoutThoroughness: 1, // by default, prefer keeping node types together over keeping parents close to children
};

const persistedNameBase = "navigateStore";

export const useCurrentViewStore = createWithEqualityFn<ViewState>()(
  triggerEvent(
    persist(temporal(devtools(() => initialViewState, { name: persistedNameBase })), {
      name: persistedNameBase,
      version: 2,
      migrate: migrate,
      skipHydration: true,
      // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
      // e.g. so that a new non-null value in initialState is non-null in the persisted state,
      // removing the need to write a migration for every new field
      merge: (persistedState, _currentState) =>
        withDefaults(persistedState as Partial<ViewState>, initialViewState),
    }),
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  // e.g. when we return URLSearchParams
  Object.is,
);

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTemporalStore = () => useStore(useCurrentViewStore.temporal);

// hooks
export const useSelectedGraphPart = () => {
  const selectedGraphPartId = useCurrentViewStore((state) => state.selectedGraphPartId);

  return useGraphPart(selectedGraphPartId);
};

export const useIsGraphPartSelected = (graphPartId: string) => {
  return useCurrentViewStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return state.selectedGraphPartId === graphPartId;
  });
};

export const useIsAnyGraphPartSelected = (graphPartIds: string[]) => {
  return useCurrentViewStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return graphPartIds.includes(state.selectedGraphPartId);
  });
};

export const useFormat = () => {
  return useCurrentViewStore((state) => state.format);
};

export const useCanGoBackForward = () => {
  const temporalStore = useTemporalStore();

  const canGoBack = temporalStore.pastStates.length > 0;
  const canGoForward = temporalStore.futureStates.length > 0;
  return [canGoBack, canGoForward];
};

// actions
export const setSelected = (graphPartId: string | null) => {
  const { selectedGraphPartId } = useCurrentViewStore.getState();
  if (selectedGraphPartId === graphPartId) return;

  useCurrentViewStore.setState({ selectedGraphPartId: graphPartId }, false, "setSelected");

  emitter.emit("partSelected", graphPartId);
};

export const setFormat = (format: Format) => {
  useCurrentViewStore.setState({ format }, false, "setFormat");
};

export const setView = (viewState: ViewState) => {
  useCurrentViewStore.setState(viewState, true, "setView");

  emitter.emit("changedDiagramFilter");
};

export const goBack = () => {
  useCurrentViewStore.temporal.getState().undo();
};

export const goForward = () => {
  useCurrentViewStore.temporal.getState().redo();
};

export const resetView = (keepHistory = false) => {
  useCurrentViewStore.setState(initialViewState, true, "resetView");
  if (!keepHistory) useCurrentViewStore.temporal.getState().clear();

  emitter.emit("changedDiagramFilter");
};

export const loadView = async (persistId: string) => {
  const builtPersistedName = `${persistedNameBase}-${persistId}`;

  useCurrentViewStore.persist.setOptions({ name: builtPersistedName });

  const urlParams = new URLSearchParams(Router.query as Record<string, string>); // seems to be fine when passing ParsedUrlQuery but ts doesn't like the types, so cast it
  const titleFromParams = urlParams.get("view");
  const quickViewFromParams = titleFromParams ? getQuickViewByTitle(titleFromParams) : undefined;

  if (quickViewFromParams) {
    useCurrentViewStore.setState(quickViewFromParams.viewState, true, "loadView");
  } else if (useCurrentViewStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useCurrentViewStore.persist.rehydrate();
  } else {
    const defaultQuickView = getDefaultQuickView();
    const defaultViewState = defaultQuickView?.viewState ?? initialViewState;

    useCurrentViewStore.setState(defaultViewState, true, "loadView");
  }

  // make sure relevant quick view is selected if there is one
  const newViewState = useCurrentViewStore.getState();
  selectViewFromState(newViewState);

  // it doesn't make sense to want to undo a page load
  useCurrentViewStore.temporal.getState().clear();
};

// util actions
export const getView = () => {
  return useCurrentViewStore.getState();
};

export const getSelectedGraphPart = () => {
  const selectedGraphPartId = useCurrentViewStore.getState().selectedGraphPartId;
  if (!selectedGraphPartId) return null;

  return getGraphPart(selectedGraphPartId);
};

// misc
emitter.on("overwroteTopicData", () => {
  resetView();
});
