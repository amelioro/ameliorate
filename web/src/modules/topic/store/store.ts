import { throttle } from "lodash";
import { useContext } from "react";
import { temporal } from "zundo";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { HydrationContext } from "../../../pages/index.page";
import { Diagram, buildNode, filterHiddenComponents } from "../utils/diagram";
import { doesDiagramExist } from "./actions";
import { migrate } from "./migrate";
import { getTopicTitle } from "./utils";

export const problemDiagramId = "root";

const initialDiagrams: Record<string, Diagram> = {
  [problemDiagramId]: {
    id: problemDiagramId,
    nodes: [buildNode({ id: "0", type: "problem", diagramId: problemDiagramId })],
    edges: [],
    type: "problem",
  },
};

export interface TopicStoreState {
  diagrams: Record<string, Diagram>;
  activeTableProblemId: string | null;
  activeClaimDiagramId: string | null;
  nextNodeId: number;
  nextEdgeId: number;
}

export const initialState: TopicStoreState = {
  diagrams: initialDiagrams,
  activeTableProblemId: null,
  activeClaimDiagramId: null,
  nextNodeId: 1, // 0 is taken by the initial node
  nextEdgeId: 0,
};

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useTopicStore = create<TopicStoreState>()(
  temporal(
    persist(immer(devtools(() => initialState)), {
      name: "diagram-storage", // should probably be "topic-storage" but don't know how to migrate
      version: 7,
      migrate: migrate,
    }),
    {
      // throttle temporal storage to group many rapid changes into one
      // specific use case is for when typing in a node, to prevent each letter change from being stored
      handleSet: (handleSet) => {
        return throttle<typeof handleSet>((state) => {
          handleSet(state);
        }, 1000);
      },
    }
  )
);

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow hooks to be extracted to a separate file
export const useTopicStoreAfterHydration = ((selector, compare) => {
  /*
  This a fix to ensure zustand never hydrates the store before React hydrates the page.
  Without this, there is a mismatch between SSR/SSG and client side on first draw which produces
  an error.
  Thanks https://github.com/pmndrs/zustand/issues/1145#issuecomment-1247061387
   */
  const store = useTopicStore(selector, compare);

  // unfortunately, useEffect triggers on first render of every component using this,
  // so when the page has already been loaded, any new component will be rendered for the first time with
  // `initialState`. we should only be using the `initialState` for the first render of the _page_,
  // not of every component, so we need to move `useEffect` to the page component.
  const isHydrated = useContext(HydrationContext);

  return isHydrated ? store : selector(initialState);
}) as typeof useTopicStore;

export const useDiagram = (diagramId: string) => {
  return useTopicStoreAfterHydration((state) => state.diagrams[diagramId]);
};

export const useFilteredDiagram = (diagramId: string) => {
  return useTopicStoreAfterHydration((state) => filterHiddenComponents(state.diagrams[diagramId]));
};

export const useDiagramType = (diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    // Zombie child issue, see https://github.com/pmndrs/zustand/issues/302
    // batchedUpdates isn't necessary because react already batches updates as of react 18
    // Batching doesn't fix this though because the error isn't when rendering, it's when checking the store's comparers
    if (!doesDiagramExist(diagramId)) return null;
    return state.diagrams[diagramId].type;
  });
};

// topic view id is the claim or problem diagram id
export const useTopicViewId = () => {
  return useTopicStoreAfterHydration(
    (state) => state.activeClaimDiagramId ?? state.activeTableProblemId ?? problemDiagramId
  );
};

export const useRootTitle = () => {
  return useTopicStoreAfterHydration((state) => getTopicTitle(state));
};

export const useActiveClaimDiagramId = () => {
  return useTopicStoreAfterHydration((state) => state.activeClaimDiagramId);
};

export const useActiveTableProblemId = () => {
  return useTopicStoreAfterHydration((state) => state.activeTableProblemId);
};

export const useClaimDiagramsWithExplicitClaims = () => {
  return useTopicStoreAfterHydration((state) =>
    Object.entries(state.diagrams)
      .filter(([id, diagram]) => id !== problemDiagramId && diagram.nodes.length > 1)
      .map(([id, diagram]) => [id, diagram.nodes[0].data.label])
  );
};
