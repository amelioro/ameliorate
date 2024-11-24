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
import { GeneralFilter } from "@/web/view/utils/generalFilter";
import { StandardFilter } from "@/web/view/utils/infoFilter";
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

  // general show/hide options
  showImpliedEdges: boolean;
  /**
   * These can be numerous and get long, making the diagram chaotic, and they're often implied,
   * so hiding them can be desirable.
   *
   * The criteria table can be used to see these relationships more clearly.
   */
  showProblemCriterionSolutionEdges: boolean;
  /**
   * Draw a simple cubic bezier for edge paths, rather than drawing paths that are output from the
   * layout algorithm.
   *
   * This only exists because the layout output does not result in vertical slopes at the start and
   * end points of each path. These vertical slopes often seem desirable, because they go with the
   * top-down flow of the diagram.
   *
   * TODO: modify algorithm for drawing path from layout algorithm, such that it has vertical slopes
   * at the start and end points of each path.
   *
   * Note: this doesn't affect layout at all, just what's shown.
   */
  drawSimpleEdgePaths: boolean;

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
  showProblemCriterionSolutionEdges: true,
  drawSimpleEdgePaths: true,

  forceNodesIntoLayers: true,
  layerNodeIslandsTogether: false,
  minimizeEdgeCrossings: true,
  layoutThoroughness: 100, // by default, prefer keeping parents close to children over keeping node types together
};

// TODO?: oftentimes don't want to reset selected part - should selectedGraphPartId really be in the view store?
export const { selectedGraphPartId: _, ...initialViewStateWithoutSelected } = initialViewState;

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

export const useDrawSimpleEdgePaths = () => {
  return useCurrentViewStore((state) => state.drawSimpleEdgePaths);
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

export const setDrawSimpleEdgePaths = (draw: boolean) => {
  useCurrentViewStore.setState({ drawSimpleEdgePaths: draw }, false, "setDrawSimpleEdgePaths");
};

/**
 * Use the initialState to fill in missing values.
 *
 * E.g. so that a new non-null value in initialState is non-null in the persisted state,
 * removing the need to write a migration for every new field.
 */
const withViewDefaults = (viewState?: Partial<ViewState>) => {
  if (!viewState) return initialViewState;
  return withDefaults(viewState, initialViewState);
};

export const setView = (viewState: ViewState) => {
  useCurrentViewStore.setState(withViewDefaults(viewState), true, "setView");

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
    useCurrentViewStore.setState(withViewDefaults(quickViewFromParams.viewState), true, "loadView");
  } else if (useCurrentViewStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useCurrentViewStore.persist.rehydrate();
  } else {
    const defaultQuickView = getDefaultQuickView();
    const defaultViewState = withViewDefaults(defaultQuickView?.viewState);

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
