import { type Topic } from "@prisma/client";
import throttle from "lodash/throttle";
import { useContext } from "react";
import { v4 as uuid } from "uuid";
import { temporal } from "zundo";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { HydrationContext } from "../../../pages/_app.page";
import {
  Diagram,
  buildNode,
  filterHiddenComponents,
  getDiagramTitle,
  problemDiagramId,
} from "../utils/diagram";
import { apiSyncer } from "./apiSyncerMiddleware";
import { migrate } from "./migrate";
import { getClaimDiagrams, getDiagram, getDiagramOrThrow, getTopicTitle } from "./utils";

const initialDiagrams: Record<string, Diagram> = {
  [problemDiagramId]: {
    id: problemDiagramId,
    nodes: [buildNode({ id: uuid(), type: "problem", diagramId: problemDiagramId })],
    edges: [],
    type: "problem",
  },
};

type StoreTopic = Omit<Topic, "createdAt" | "updatedAt">;

export interface TopicStoreState {
  topic: StoreTopic | null;
  diagrams: Record<string, Diagram>;
  activeTableProblemId: string | null;
  activeClaimDiagramId: string | null;
  showImpliedEdges: boolean;
}

export const initialState: TopicStoreState = {
  topic: null,
  diagrams: initialDiagrams,
  activeTableProblemId: null,
  activeClaimDiagramId: null,
  showImpliedEdges: true,
};

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useTopicStore = create<TopicStoreState>()(
  apiSyncer(
    temporal(
      persist(
        devtools(() => initialState),
        {
          name: "diagram-storage", // should probably be "topic-storage" but don't know how to migrate
          version: 13,
          migrate: migrate,
          skipHydration: true,
        }
      ),
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
  )
);

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow hooks to be extracted to a separate file
// TODO: can we remove this, since we're manually invoking rehydrate now?
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
  return useTopicStoreAfterHydration((state) => {
    const diagram = getDiagramOrThrow(state, diagramId);
    return filterHiddenComponents(diagram, getClaimDiagrams(state), state.showImpliedEdges);
  });
};

export const useDiagramType = (diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    // Zombie child issue, see https://github.com/amelioro/ameliorate/blob/main/docs/state-management.md#zombie-child-issue
    // batchedUpdates isn't necessary because react already batches updates as of react 18
    // Batching doesn't fix this though because the error isn't when rendering, it's when checking the store's comparers
    const diagram = getDiagram(state, diagramId);
    if (!diagram) return null;

    return diagram.type;
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

export const useIsTableActive = () => {
  return useTopicStoreAfterHydration(
    (state) => state.activeClaimDiagramId === null && state.activeTableProblemId !== null
  );
};

export const useClaimDiagramsWithExplicitClaims = () => {
  return useTopicStoreAfterHydration((state) =>
    Object.entries(state.diagrams)
      .filter(([id, diagram]) => id !== problemDiagramId && diagram.nodes.length > 1)
      .map(([id, diagram]) => [id, getDiagramTitle(diagram)] as [string, string])
  );
};

export const useShowImpliedEdges = () => {
  return useTopicStoreAfterHydration((state) => state.showImpliedEdges);
};
