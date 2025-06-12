import Router from "next/router";
import shortUUID from "short-uuid";
import { temporal } from "zundo";
import { useStore } from "zustand";
import { StorageValue, devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { errorWithData } from "@/common/errorHandling";
import { withDefaults } from "@/common/object";
import { deepIsEqual } from "@/common/utils";
import { emitter } from "@/web/common/event";
import {
  ViewState,
  getView,
  initialViewState,
  setView,
  withViewDefaults,
} from "@/web/view/currentViewStore/store";
import { apiSyncer } from "@/web/view/quickViewStore/apiSyncerMiddleware";
import { migrate } from "@/web/view/quickViewStore/migrate";

type QuickViewType = "quick"; // eventually maybe separate "recommended" vs "personal"

export interface QuickViewStoreState {
  views: QuickView[];
  selectedViewId: string | null;
}

// TODO: build type from quickViewSchema once view state is extracted to common
export interface QuickView {
  id: string;
  type: QuickViewType;
  title: string;
  order: number;
  viewState: ViewState;
}

const initialState: QuickViewStoreState = {
  views: [],
  selectedViewId: null,
};

export const generateBasicViews = (): QuickView[] => {
  return [
    {
      id: shortUUID.generate(), // generate UUIDs that are easier to read (shorter, alphanumeric)
      type: "quick",
      title: "Breakdown",
      order: 0,
      viewState: initialViewState,
    },
    {
      id: shortUUID.generate(),
      type: "quick",
      title: "Research",
      order: 1,
      viewState: withDefaults({ categoriesToShow: ["research"] }, initialViewState),
    },
  ];
};

export const initialStateWithBasicViews = () => {
  return withDefaults({ views: generateBasicViews() }, initialState);
};

const persistedNameBase = "quickViewStore";
export const currentVersion = 3;

export const useQuickViewStore = createWithEqualityFn<QuickViewStoreState>()(
  apiSyncer(
    persist(temporal(devtools(() => initialState, { name: persistedNameBase })), {
      name: persistedNameBase,
      version: currentVersion,
      migrate: migrate,
      skipHydration: true,
      // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
      // e.g. so that a new non-null value in initialState is non-null in the persisted state,
      // removing the need to write a migration for every new field
      merge: (persistedState, _currentState) =>
        withDefaults(persistedState as Partial<QuickViewStoreState>, initialState),
    }),
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  Object.is,
);

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTemporalStore = () => useStore(useQuickViewStore.temporal);

// hooks
export const useQuickViews = () => {
  return useQuickViewStore((state) =>
    state.views.toSorted((view1, view2) => view1.order - view2.order),
  );
};

export const useSelectedViewId = () => {
  return useQuickViewStore((state) => state.selectedViewId);
};

export const useCanUndoRedo = () => {
  const temporalStore = useTemporalStore();

  const canUndo = temporalStore.pastStates.length > 0;
  const canRedo = temporalStore.futureStates.length > 0;
  return [canUndo, canRedo];
};

// actions
const getNewTitle = (existingTitles: string[]) => {
  // eslint-disable-next-line functional/no-loop-statements, functional/no-let
  for (let i = 0; i < existingTitles.length; i++) {
    if (!existingTitles.includes(`View ${i + 1}`)) return `View ${i + 1}`;
  }

  return `View ${existingTitles.length + 1}`;
};

export const createView = () => {
  const state = useQuickViewStore.getState();
  const currentView = getView();

  const newViewId = shortUUID.generate();
  const newTitle = getNewTitle(state.views.map((view) => view.title));

  const newQuickView: QuickView = {
    id: newViewId,
    type: "quick",
    title: newTitle,
    // provide -1 by default to `Math.max` because otherwise it returns -Infinity with no arguments
    order: Math.max(-1, ...state.views.map((view) => view.order)) + 1,
    viewState: currentView,
  };

  useQuickViewStore.setState(
    (state) => ({
      views: state.views.concat(newQuickView),
      selectedViewId: newViewId,
    }),
    false,
    "createView",
  );
};

export const setTitle = (viewId: string, newTitle: string) => {
  const state = useQuickViewStore.getState();

  const viewToRename = state.views.find((view) => view.id === viewId);
  if (!viewToRename) throw new Error(`No view with id ${viewId}`);

  useQuickViewStore.setState(
    {
      views: state.views.map((view) =>
        view.id === viewToRename.id ? { ...view, title: newTitle } : view,
      ),
    },
    false,
    "setTitle",
  );

  const updatedSelectedView = state.selectedViewId === viewId;
  if (updatedSelectedView) updateURLParams(newTitle);
};

export const saveView = (viewId: string) => {
  const state = useQuickViewStore.getState();
  const currentView = getView();

  const viewToSave = state.views.find((view) => view.id === viewId);
  if (!viewToSave) throw new Error(`No view with id ${viewId}`);

  useQuickViewStore.setState(
    {
      views: state.views.map((view) =>
        view.id === viewToSave.id ? { ...view, viewState: currentView } : view,
      ),
      selectedViewId: state.selectedViewId ?? viewId, // after saving, the newly-saved view should match the current view state, so select it if nothing is selected
    },
    false,
    "saveView",
  );
};

export const deleteView = (viewId: string) => {
  const state = useQuickViewStore.getState();

  const viewToDelete = state.views.find((view) => view.id === viewId);
  if (!viewToDelete) throw new Error(`No view with id ${viewId}`);

  useQuickViewStore.setState(
    {
      views: state.views.filter((view) => view.id !== viewToDelete.id),
      selectedViewId: state.selectedViewId === viewId ? null : state.selectedViewId,
    },
    false,
    "deleteView",
  );
};

export const moveView = (viewId: string, direction: "up" | "down") => {
  const views = useQuickViewStore
    .getState()
    .views.toSorted((view1, view2) => view1.order - view2.order);

  const indexFrom = views.findIndex((view) => view.id === viewId);
  if (indexFrom === -1) throw new Error(`No view with id ${viewId}`);
  if (indexFrom === 0 && direction === "up") return;
  if (indexFrom === views.length - 1 && direction === "down") return;

  const viewsWithoutMoved = views.toSpliced(indexFrom, 1);
  const reorderedViews = viewsWithoutMoved.toSpliced(
    direction === "up" ? indexFrom - 1 : indexFrom + 1,
    0,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we found the index from `views`, we know it exists
    views[indexFrom]!,
  );

  useQuickViewStore.setState(
    {
      views: reorderedViews.map((view, index) => ({ ...view, order: index })),
    },
    false,
    "moveView",
  );
};

/**
 * if deselecting, remove the view param, else set the view param to the view's title
 */
const updateURLParams = (viewTitle: string | null) => {
  const { search, pathname } = window.location;

  const currentParams = new URLSearchParams(search);
  if (viewTitle !== null) currentParams.set("view", viewTitle);
  else currentParams.delete("view");

  void Router.replace({ pathname, query: currentParams.toString() }, undefined, { shallow: true });
};

// eslint-disable-next-line functional/no-let -- hack to avoid deselecting the view immediately after selecting it
let selectingView = false;

/**
 * @param viewId id of the view to select, or null to deselect
 */
export const selectView = (viewId: string | null) => {
  const { views } = useQuickViewStore.getState();

  const newlySelectedView = viewId !== null ? views.find((view) => view.id === viewId) : null;

  if (newlySelectedView === undefined) throw new Error(`No view with id ${viewId}`);

  selectingView = true;

  // would be annoying to make undo update the currentViewStore too, so just don't impact undo/redo at all when selecting
  // just use the currentViewStore's back to undo something like that.
  useQuickViewStore.temporal.getState().pause();
  useQuickViewStore.setState({ selectedViewId: viewId }, false, "selectView");
  useQuickViewStore.temporal.getState().resume();

  if (newlySelectedView !== null) setView(newlySelectedView.viewState);
  updateURLParams(newlySelectedView?.title ?? null);

  selectingView = false;
};

/**
 * Different from `selectView` because this just sets the selected view without triggering further
 * changes based on the selected view i.e. no URL changes, no current view changes.
 *
 * This is because these things are unexpected when the selection changes automatically.
 */
const recalculateSelectedView = (newView: ViewState) => {
  const state = useQuickViewStore.getState();

  // If the view changed, and the state matches a Quick View, set that Quick View as selected,
  // otherwise deselect the selected view.
  // Doing a deep comparison for each quick view on every current view change is probably a
  // bit unperformant, but it's nice to have so we know if our view is the same as an existing one.
  const match = state.views.find((view) => deepIsEqual(withViewDefaults(view.viewState), newView));
  const newViewId = match ? match.id : null;
  if (state.selectedViewId === newViewId) return;

  // new recalculated selection shouldn't be undoable because it was automatic
  useQuickViewStore.temporal.getState().pause();
  useQuickViewStore.setState({ selectedViewId: newViewId }, false, "recalculateSelectedView");
  useQuickViewStore.temporal.getState().resume();
};

export const selectViewFromState = (viewState: ViewState) => {
  const { views } = useQuickViewStore.getState();

  const view = views.find((view) => deepIsEqual(withViewDefaults(view.viewState), viewState));
  if (view === undefined) return;

  useQuickViewStore.temporal.getState().pause();
  useQuickViewStore.setState({ selectedViewId: view.id }, false, "selectViewFromState");
  useQuickViewStore.temporal.getState().resume();

  // don't set current view because this is called after loading current view
  // could set URL but this is called after page load, so doesn't seem worth it
};

export const undo = () => {
  useQuickViewStore.temporal.getState().undo();
};

export const redo = () => {
  useQuickViewStore.temporal.getState().redo();
};

export const resetQuickViews = () => {
  useQuickViewStore.setState(initialStateWithBasicViews(), true, "reset");
};

export const loadQuickViewsFromApi = (views: QuickView[]) => {
  const builtPersistedName = `${persistedNameBase}-user`;
  useQuickViewStore.persist.setOptions({ name: builtPersistedName });

  useQuickViewStore.apiSyncer.pause();

  useQuickViewStore.setState(
    {
      // specify each field because we don't need to store extra data like createdAt etc.
      views: views.map((view) => ({
        id: view.id,
        type: view.type,
        title: view.title,
        order: view.order,
        viewState: view.viewState,
      })),
      selectedViewId: null, // don't remember from previous topic - this will be set after loading current view if it should be
    },
    true,
    "loadQuickViewsFromApi",
  );

  useQuickViewStore.apiSyncer.resume();

  // it doesn't make sense to want to undo a page load
  useQuickViewStore.temporal.getState().clear();
};

export const loadQuickViewsFromLocalStorage = async () => {
  const builtPersistedName = `${persistedNameBase}-playground`;
  useQuickViewStore.persist.setOptions({ name: builtPersistedName });

  useQuickViewStore.apiSyncer.pause();

  if (useQuickViewStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useQuickViewStore.persist.rehydrate();
  } else {
    useQuickViewStore.setState(initialStateWithBasicViews(), true, "loadFromLocalStorage");
  }

  useQuickViewStore.apiSyncer.resume();

  // it doesn't make sense to want to undo a page load
  useQuickViewStore.temporal.getState().clear();
};

export const loadQuickViewsFromDownloaded = (json: QuickViewStoreState) => {
  useQuickViewStore.setState(json, true, "loadQuickViewsFromJson");
};

// utils
export const getQuickViewByTitle = (title: string) => {
  const { views } = useQuickViewStore.getState();
  return views.find((view) => view.title === title);
};

export const getSelectedViewTitle = () => {
  const state = useQuickViewStore.getState();

  const selectedView = state.views.find((view) => view.id === state.selectedViewId);
  if (!selectedView) return null;

  return selectedView.title;
};

export const getDefaultQuickView = () => {
  const { views } = useQuickViewStore.getState();
  const orderedViews = views.toSorted((view1, view2) => view1.order - view2.order);
  return orderedViews[0];
};

export const getPersistState = () => {
  const persistOptions = useQuickViewStore.persist.getOptions();
  if (!persistOptions.storage || !persistOptions.name) {
    throw errorWithData("Store persist options missing storage or name", persistOptions);
  }

  return persistOptions.storage.getItem(persistOptions.name) as StorageValue<QuickViewStoreState>;
};

// misc
// ensure selected quick view is updated when the current view changes
emitter.on("changedView", (newView) => {
  if (selectingView) return; // don't change selected view if this event was triggered by selection

  recalculateSelectedView(newView);
});
