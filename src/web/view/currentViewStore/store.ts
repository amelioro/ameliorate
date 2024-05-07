import { temporal } from "zundo";
import { useStore } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { Format, InfoCategory } from "../../../common/infoCategory";
import { nodeTypes } from "../../../common/node";
import { withDefaults } from "../../../common/object";
import { emitter } from "../../common/event";
import { useGraphPart } from "../../topic/store/graphPartHooks";
import { StandardFilter } from "../utils/diagramFilter";
import { GeneralFilter } from "../utils/generalFilter";
import { TableFilter } from "../utils/tableFilter";

interface CurrentViewStoreState {
  selectedGraphPartId: string | null;
  format: Format;

  // info category state is flattened (rather than `[category]: state`) for ease of modifying
  categoriesToShow: InfoCategory[];
  structureFilter: StandardFilter;
  researchFilter: StandardFilter;
  justificationFilter: StandardFilter;

  tableFilter: TableFilter;
  generalFilter: GeneralFilter;

  // infrequent options
  showImpliedEdges: boolean;

  // layout
  forceNodesIntoLayers: boolean;
  layoutThoroughness: number;
}

const initialState: CurrentViewStoreState = {
  selectedGraphPartId: null,
  format: "diagram",

  categoriesToShow: ["structure"],
  structureFilter: { type: "none" },
  researchFilter: { type: "none" },
  justificationFilter: { type: "none" },

  tableFilter: {
    solutions: [],
    criteria: [],
  },
  generalFilter: {
    nodeTypes: [...nodeTypes], // spread because this value is otherwise readonly
    showOnlyScored: false,
    scoredComparer: "≥",
    scoreToCompare: "5",
    nodesToShow: [],
    nodesToHide: [],
    showSecondaryResearch: false,
    showSecondaryStructure: true,
  },

  showImpliedEdges: false,

  forceNodesIntoLayers: true,
  layoutThoroughness: 1, // by default, prefer keeping node types together over keeping parents close to children
};

const persistedNameBase = "navigateStore";

export const useCurrentViewStore = createWithEqualityFn<CurrentViewStoreState>()(
  temporal(
    persist(
      devtools(() => initialState),
      {
        name: persistedNameBase,
        version: 1,
        skipHydration: true,
        // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
        // e.g. so that a new non-null value in initialState is non-null in the persisted state,
        // removing the need to write a migration for every new field
        merge: (persistedState, _currentState) =>
          withDefaults(persistedState as Partial<CurrentViewStoreState>, initialState),
      }
    )
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  // e.g. when we return URLSearchParams
  Object.is
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
  useCurrentViewStore.setState({ selectedGraphPartId: graphPartId }, false, "setSelected");
};

export const setFormat = (format: Format) => {
  useCurrentViewStore.setState({ format }, false, "setFormat");
};

export const goBack = () => {
  useCurrentViewStore.temporal.getState().undo();
};

export const goForward = () => {
  useCurrentViewStore.temporal.getState().redo();
};

export const resetView = (keepHistory = false) => {
  useCurrentViewStore.setState(initialState, true, "resetView");
  if (!keepHistory) useCurrentViewStore.temporal.getState().clear();

  emitter.emit("changedDiagramFilter");
};

export const loadView = async (persistId: string) => {
  const builtPersistedName = `${persistedNameBase}-${persistId}`;

  useCurrentViewStore.persist.setOptions({ name: builtPersistedName });

  if (useCurrentViewStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useCurrentViewStore.persist.rehydrate();
  } else {
    useCurrentViewStore.setState(initialState, true, "loadView");
  }

  // it doesn't make sense to want to undo a page load
  useCurrentViewStore.temporal.getState().clear();
};
