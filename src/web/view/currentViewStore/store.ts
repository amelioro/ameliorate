import Router from "next/router";
import { temporal } from "zundo";
import { useStore } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { Format, InfoCategory } from "@/common/infoCategory";
import { withDefaults } from "@/common/object";
import { emitter } from "@/web/common/event";
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

  // layout
  forceNodesIntoLayers: boolean;
  layerNodeIslandsTogether: boolean;
  minimizeEdgeCrossings: boolean;
  /**
   * Ideally we'd always avoid edge label overlap, because the diagram seems more chaotic when
   * there's overlap, but unfortunately including labels in the layout create a few problems:
   * 1. spacing between node layers can be consistent,
   * 2. more node layers can be created than otherwise.
   *
   * These problems both result in a layout that often seems even more chaotic than just
   * accepting edge overlap.
   *
   * This ELK ticket exists to address these issues, and if resolved, we should be able to
   * unconditionally include edge labels in layout: https://github.com/eclipse/elk/issues/1092
   */
  avoidEdgeLabelOverlap: boolean;
  layoutThoroughness: number;
}

export const initialViewState: ViewState = {
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

  forceNodesIntoLayers: true,
  layerNodeIslandsTogether: false,
  minimizeEdgeCrossings: false,
  avoidEdgeLabelOverlap: false,
  layoutThoroughness: 100, // by default, prefer keeping parents close to children over keeping node types together
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
export const setFormat = (format: Format) => {
  useCurrentViewStore.setState({ format }, false, "setFormat");
};

/**
 * Use the initialState to fill in missing values.
 *
 * E.g. so that a new non-null value in initialState is non-null in the persisted state,
 * removing the need to write a migration for every new field.
 */
export const withViewDefaults = (viewState?: Partial<ViewState>) => {
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

// misc
emitter.on("overwroteTopicData", () => {
  resetView();
});
