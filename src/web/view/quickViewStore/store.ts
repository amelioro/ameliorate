import Router from "next/router";
import shortUUID from "short-uuid";
import { temporal } from "zundo";
import { useStore } from "zustand";
import { StorageValue, devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { errorWithData } from "../../../common/errorHandling";
import { withDefaults } from "../../../common/object";
import { emitter } from "../../common/event";
import { deepIsEqual } from "../../common/store/utils";
import { StoreTopic, UserTopic } from "../../topic/store/store";
import { ViewState, getView, initialViewState, setView } from "../currentViewStore/store";
import { apiSyncer } from "./apiSyncerMiddleware";

type QuickViewType = "quick"; // eventually maybe separate "recommended" vs "personal"

export interface QuickViewStoreState {
  /**
   * The page's current topic. This is a bit of a hack to give us a way to prevent api-syncing the quick views when the topic changes.
   */
  topic: StoreTopic;
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
  topic: { id: undefined, description: "" },
  views: [],
  selectedViewId: null,
};

export const generateBasicViews = (): QuickView[] => {
  return [
    {
      id: shortUUID.generate(), // generate UUIDs that are easier to read (shorter, alphanumeric)
      type: "quick",
      title: "All Structure",
      order: 0,
      viewState: initialViewState,
    },
    {
      id: shortUUID.generate(),
      type: "quick",
      title: "All Research",
      order: 1,
      viewState: withDefaults({ categoriesToShow: ["research"] }, initialViewState),
    },
  ];
};

export const initialStateWithBasicViews = () => {
  return withDefaults({ views: generateBasicViews() }, initialState);
};

const persistedNameBase = "quickViewStore";
export const currentVersion = 1;

export const useQuickViewStore = createWithEqualityFn<QuickViewStoreState>()(
  apiSyncer(
    persist(temporal(devtools(() => initialState, { name: persistedNameBase })), {
      name: persistedNameBase,
      version: currentVersion,
      skipHydration: true,
      // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
      // e.g. so that a new non-null value in initialState is non-null in the persisted state,
      // removing the need to write a migration for every new field
      merge: (persistedState, _currentState) =>
        withDefaults(persistedState as Partial<QuickViewStoreState>, initialState),
    })
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  Object.is
);

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTemporalStore = () => useStore(useQuickViewStore.temporal);

// hooks
export const useQuickViews = () => {
  return useQuickViewStore((state) =>
    state.views.toSorted((view1, view2) => view1.order - view2.order)
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
    order: state.views.length,
    viewState: currentView,
  };

  useQuickViewStore.setState(
    (state) => ({
      views: state.views.concat(newQuickView),
      selectedViewId: newViewId,
    }),
    false,
    "createView"
  );
};

export const setTitle = (viewId: string, newTitle: string) => {
  const state = useQuickViewStore.getState();

  const viewToRename = state.views.find((view) => view.id === viewId);
  if (!viewToRename) throw new Error(`No view with id ${viewId}`);

  useQuickViewStore.setState(
    {
      views: state.views.map((view) =>
        view.id === viewToRename.id ? { ...view, title: newTitle } : view
      ),
    },
    false,
    "setTitle"
  );

  updateURLParams(newTitle);
};

export const saveView = (viewId: string) => {
  const state = useQuickViewStore.getState();
  const currentView = getView();

  const viewToSave = state.views.find((view) => view.id === viewId);
  if (!viewToSave) throw new Error(`No view with id ${viewId}`);

  useQuickViewStore.setState(
    {
      views: state.views.map((view) =>
        view.id === viewToSave.id ? { ...view, viewState: currentView } : view
      ),
      selectedViewId: state.selectedViewId ?? viewId, // after saving, the newly-saved view should match the current view state, so select it if nothing is selected
    },
    false,
    "saveView"
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
    "deleteView"
  );
};

/**
 * if deselecting, remove the view param, else set the view param to the view's title
 */
const updateURLParams = (viewTitle: string | null) => {
  const currentParams = new URLSearchParams(Router.query as Record<string, string>); // seems to be fine when passing ParsedUrlQuery but ts doesn't like the types, so cast it
  if (viewTitle !== null) currentParams.set("view", viewTitle);
  else currentParams.delete("view");

  void Router.replace({ query: currentParams.toString() }, undefined, { shallow: true });
};

/**
 * @param viewId id of the view to select, or null to deselect
 */
export const selectView = (viewId: string | null) => {
  const { views } = useQuickViewStore.getState();

  const newlySelectedView = viewId !== null ? views.find((view) => view.id === viewId) : null;

  if (newlySelectedView === undefined) throw new Error(`No view with id ${viewId}`);

  // would be annoying to make undo update the currentViewStore too, so just don't impact undo/redo at all when selecting
  // just use the currentViewStore's back to undo something like that.
  useQuickViewStore.temporal.getState().pause();
  useQuickViewStore.setState({ selectedViewId: viewId }, false, "selectView");
  useQuickViewStore.temporal.getState().resume();

  if (newlySelectedView !== null) setView(newlySelectedView.viewState);
  updateURLParams(newlySelectedView?.title ?? null);
};

export const selectViewFromState = (viewState: ViewState) => {
  const { views } = useQuickViewStore.getState();

  const view = views.find((view) => deepIsEqual(view.viewState, viewState));
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

export const loadQuickViewsFromApi = (topic: UserTopic, views: QuickView[]) => {
  const builtPersistedName = `${persistedNameBase}-user`;

  useQuickViewStore.persist.setOptions({ name: builtPersistedName });

  useQuickViewStore.setState(
    {
      topic,
      // map views because we don't need to store extra data in the store like createdAt, topicId, etc
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
    "loadQuickViewsFromApi"
  );

  // it doesn't make sense to want to undo a page load
  useQuickViewStore.temporal.getState().clear();
};

export const loadQuickViewsFromLocalStorage = async () => {
  const builtPersistedName = `${persistedNameBase}-playground`;

  useQuickViewStore.persist.setOptions({ name: builtPersistedName });

  if (useQuickViewStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useQuickViewStore.persist.rehydrate();
  } else {
    useQuickViewStore.setState(initialStateWithBasicViews(), true, "loadFromLocalStorage");
  }

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
// if the view changes and a quick view is selected, deselect the quick view
emitter.on("changedView", (newView) => {
  const state = useQuickViewStore.getState();
  if (state.selectedViewId === null) return;

  const selectedView = state.views.find((view) => view.id === state.selectedViewId);
  if (selectedView === undefined) throw new Error(`No view with id ${state.selectedViewId}`);

  if (!deepIsEqual(selectedView.viewState, newView)) {
    selectView(null);
  }
});
