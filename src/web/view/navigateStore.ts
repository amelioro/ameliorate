import { useSearchParams } from "next/navigation";
import Router from "next/router";
import { useEffect, useState } from "react";
import { createWithEqualityFn } from "zustand/traditional";

import { throwError } from "../../common/errorHandling";
import { researchNodeTypes, topicNodeTypes } from "../../common/node";
import { emitter } from "../common/event";
import { useGraphPart } from "../topic/store/graphPartHooks";
import { useNode } from "../topic/store/nodeHooks";
import { useTopicStore } from "../topic/store/store";
import { FilterOptions } from "./utils/filter";

export type View = "topicDiagram" | "researchDiagram" | "criteriaTable" | "claimTree";

interface NavigateStoreState {
  selectedGraphPartId: string | null;
  viewingResearchDiagram: boolean;

  viewingCriteriaTable: boolean;
  activeTableProblemId: string | null;

  viewingClaimTree: boolean;
  activeClaimTreeId: string | null;

  filterOptions: Partial<Record<View, FilterOptions>>;
}

const initialState: NavigateStoreState = {
  selectedGraphPartId: null,
  viewingResearchDiagram: false,

  viewingCriteriaTable: false,
  activeTableProblemId: null,

  viewingClaimTree: false,
  activeClaimTreeId: null,

  filterOptions: {
    topicDiagram: {
      nodeTypes: topicNodeTypes,
      showSecondaryNeighbors: false,
      type: "none",
    },
    researchDiagram: {
      nodeTypes: researchNodeTypes,
      showSecondaryNeighbors: true,
      type: "none",
    },
  },
};

const useNavigateStore = createWithEqualityFn<NavigateStoreState>()(
  () => initialState,

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  // e.g. when we return URLSearchParams
  Object.is
);

// hooks
export const useSelectedGraphPart = () => {
  const selectedGraphPartId = useNavigateStore((state) => state.selectedGraphPartId);

  return useGraphPart(selectedGraphPartId);
};

export const useIsGraphPartSelected = (graphPartId: string) => {
  return useNavigateStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return state.selectedGraphPartId === graphPartId;
  });
};

export const useIsAnyGraphPartSelected = (graphPartIds: string[]) => {
  return useNavigateStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return graphPartIds.includes(state.selectedGraphPartId);
  });
};

export const useActiveView = () => {
  return useNavigateStore((state) => {
    return getActiveView(state);
  });
};

export const useSecondaryView = () => {
  return useNavigateStore((state) => {
    if (state.viewingClaimTree) {
      // only claim tree is layered in front of another view for now
      if (state.viewingCriteriaTable) return "criteriaTable";
      if (state.viewingResearchDiagram) return "researchDiagram";
      return "topicDiagram";
    }
    return null;
  });
};

export const useActiveTableProblemNode = () => {
  const activeTableProblemId = useNavigateStore((state) => state.activeTableProblemId);

  return useNode(activeTableProblemId);
};

export const useActiveArguedDiagramPart = () => {
  const activeClaimTreeId = useNavigateStore((state) => state.activeClaimTreeId);

  return useGraphPart(activeClaimTreeId);
};

export const useFilterOptions = (view: View) => {
  return useNavigateStore((state) => {
    return (
      state.filterOptions[view] ??
      throwError(
        "Filter options only exist for the topic or research diagrams",
        view,
        state.filterOptions
      )
    );
  });
};

// actions
export const setSelected = (graphPartId: string | null) => {
  useNavigateStore.setState({ selectedGraphPartId: graphPartId });
};

export const viewTopicDiagram = () => {
  useNavigateStore.setState({
    viewingResearchDiagram: false,
    viewingCriteriaTable: false,
    viewingClaimTree: false,
  });
};

export const viewResearchDiagram = () => {
  useNavigateStore.setState({
    viewingResearchDiagram: true,
    viewingCriteriaTable: false,
    viewingClaimTree: false,
  });
};

export const closeResearchDiagram = () => {
  useNavigateStore.setState({ viewingResearchDiagram: false });
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useNavigateStore.setState({
    viewingCriteriaTable: true,
    viewingClaimTree: false,
    activeTableProblemId: problemNodeId,
  });
};

export const closeTable = () => {
  useNavigateStore.setState({ viewingCriteriaTable: false });
};

export const viewClaimTree = (arguedDiagramPartId: string) => {
  useNavigateStore.setState({ viewingClaimTree: true, activeClaimTreeId: arguedDiagramPartId });
};

export const closeClaimTree = () => {
  useNavigateStore.setState({ viewingClaimTree: false });
};

export const resetNavigation = () => {
  useNavigateStore.setState(initialState);
};

export const setFilterOptions = (filterOptions: FilterOptions) => {
  const state = useNavigateStore.getState();
  const activeView = getActiveView(state);

  if (!state.filterOptions[activeView])
    throw new Error("Filter options can only be set when viewing the topic or research diagrams");

  useNavigateStore.setState({
    filterOptions: { ...state.filterOptions, [activeView]: filterOptions },
  });

  emitter.emit("changedFilter");
};

// helpers
const getActiveView = (state: NavigateStoreState): View => {
  if (state.viewingClaimTree) return "claimTree";
  if (state.viewingCriteriaTable) return "criteriaTable";
  if (state.viewingResearchDiagram) return "researchDiagram";
  return "topicDiagram";
};

const findGraphPartIdBySubstring = (graphPartIdSubstring: string | null) => {
  if (!graphPartIdSubstring) return null;

  const state = useTopicStore.getState();

  const graphPart =
    state.nodes.find((node) => node.id.startsWith(graphPartIdSubstring)) ??
    state.edges.find((edge) => edge.id.startsWith(graphPartIdSubstring));

  return graphPart?.id ?? null;
};

const processSearchParams = (searchParams: URLSearchParams) => {
  const selectedGraphPartIdSubstring = searchParams.get("selected")?.toLowerCase() ?? null;
  const selectedGraphPartId = findGraphPartIdBySubstring(selectedGraphPartIdSubstring);
  setSelected(selectedGraphPartId);

  const viewParam = searchParams.get("view")?.toLowerCase();
  if (viewParam) {
    const [view, graphPartIdSubstring] = viewParam.split(":") as [View, string];
    const graphPartId = findGraphPartIdBySubstring(graphPartIdSubstring);
    if (view === "researchDiagram".toLowerCase()) {
      viewResearchDiagram();
    } else if (view === "criteriaTable".toLowerCase() && graphPartId) {
      viewCriteriaTable(graphPartId);
    } else if (view === "claimTree".toLowerCase() && graphPartId) {
      viewClaimTree(graphPartId);
    }
  } else {
    viewTopicDiagram();
  }
};

/**
 * Used for search params to keep them short and readable.
 */
const trimPartId = (partId: string) => {
  // Using the first 8 chars, 10000 guids have 1% probability collision
  // This seems reasonable; most topics will have a number of graph parts in the 100s
  return partId.substring(0, 8);
};

const getCalculatedSearchParams = (state: NavigateStoreState) => {
  const selectedParam = state.selectedGraphPartId
    ? `selected=${trimPartId(state.selectedGraphPartId)}`
    : "";

  const activeView = getActiveView(state);
  const viewParam =
    activeView === "researchDiagram"
      ? `view=${activeView}`
      : activeView === "criteriaTable" && state.activeTableProblemId
      ? `view=${activeView}:${trimPartId(state.activeTableProblemId)}`
      : activeView === "claimTree" && state.activeClaimTreeId
      ? `view=${activeView}:${trimPartId(state.activeClaimTreeId)}`
      : "";

  return new URLSearchParams([selectedParam, viewParam].join("&"));
};

const useCalculatedSearchParams = () => {
  return useNavigateStore(
    (state) => getCalculatedSearchParams(state),
    (a, b) => {
      return a.toString() === b.toString();
    }
  );
};

const useUpdateStoreFromSearchParams = (topicDiagramInitiallyLoaded: boolean) => {
  const readonlyUrlSearchParams = useSearchParams();

  // has to be in useEffect because can trigger render of other components
  useEffect(() => {
    // `useSearchParams` was fixed to exclude path params in next 13.4.20-canary.37 https://github.com/vercel/next.js/pull/55280
    // but netlify doesn't support next versions beyond 13.4.19 https://answers.netlify.com/t/runtime-importmoduleerror-error-cannot-find-module-styled-jsx-style/102375/28
    const urlSearchParams = new URLSearchParams(readonlyUrlSearchParams);
    urlSearchParams.delete("username");
    urlSearchParams.delete("topicTitle");

    const calculatedSearchParams = getCalculatedSearchParams(useNavigateStore.getState());
    const storeMatchesURL = urlSearchParams.toString() == calculatedSearchParams.toString();

    if (storeMatchesURL || !topicDiagramInitiallyLoaded) return;

    processSearchParams(urlSearchParams);
  }, [readonlyUrlSearchParams, topicDiagramInitiallyLoaded]);
};

const getNewSearchParamsString = (
  calculatedSearchParams: URLSearchParams,
  oldUrlSearchParams: URLSearchParams
) => {
  const newUrlSearchParams = new URLSearchParams(oldUrlSearchParams.toString());

  const view = calculatedSearchParams.get("view");
  if (view) newUrlSearchParams.set("view", view);
  else newUrlSearchParams.delete("view");

  const selected = calculatedSearchParams.get("selected");
  if (selected) newUrlSearchParams.set("selected", selected);
  else newUrlSearchParams.delete("selected"); // annoying that setting no value doesn't do this

  const searchParamsString = newUrlSearchParams.toString()
    ? // decode to allow `:` in params; this should be ok https://stackoverflow.com/a/5330261/8409296
      `?${decodeURIComponent(newUrlSearchParams.toString())}`
    : "";

  return searchParamsString;
};

const useUpdateSearchParamsFromStore = (topicDiagramInitiallyLoaded: boolean) => {
  const calculatedSearchParams = useCalculatedSearchParams();
  const [oldCalculatedParams, setOldCalculatedParams] = useState(calculatedSearchParams);

  // useEffect so that Router exists; maybe also necessary to setOldCalculatedParams without optimizing and skipping over the rest
  useEffect(() => {
    const calculatedParamsChanged =
      calculatedSearchParams.toString() !== oldCalculatedParams.toString();
    if (!calculatedParamsChanged) return; // other things could trigger this hook, but we don't care about those

    setOldCalculatedParams(calculatedSearchParams);

    const [pathWithoutSearchParams, urlSearchParamsString] = Router.asPath.split("?");
    const urlSearchParams = new URLSearchParams(urlSearchParamsString);
    const storeMatchesURL = urlSearchParams.toString() == calculatedSearchParams.toString();

    if (storeMatchesURL || !topicDiagramInitiallyLoaded) return;

    const searchParamsString = getNewSearchParamsString(calculatedSearchParams, urlSearchParams);
    const newPath = pathWithoutSearchParams + searchParamsString;

    void Router.push(newPath, undefined);
  }, [calculatedSearchParams, oldCalculatedParams, topicDiagramInitiallyLoaded]);
};

/**
 * Update the store when URL search params change, and vice versa.
 *
 * Infinite loops should be prevented because both sides return if store params == URL params.
 *
 * @param topicDiagramInitiallyLoaded we want to be able to use a substring for graph part ids, which
 * means we need to be able to search the topic store for graph part ids, which meanas we need to
 * start syncing after the topic store is loaded.
 */
export const useSyncSearchParamsWithStore = (topicDiagramInitiallyLoaded: boolean) => {
  useUpdateStoreFromSearchParams(topicDiagramInitiallyLoaded);
  useUpdateSearchParamsFromStore(topicDiagramInitiallyLoaded);
};
