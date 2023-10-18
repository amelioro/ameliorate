import { temporal } from "zundo";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import {
  Diagram,
  Score,
  buildNode,
  filterHiddenComponents,
  getDiagramTitle,
  topicDiagramId,
} from "../utils/diagram";
import { apiSyncer } from "./apiSyncerMiddleware";
import { migrate } from "./migrate";
import { getClaimTrees, getDiagram, getDiagramOrThrow, getTopicTitle } from "./utils";

const initialDiagrams: Record<string, Diagram> = {
  [topicDiagramId]: {
    id: topicDiagramId,
    nodes: [buildNode({ type: "problem", diagramId: topicDiagramId })],
    edges: [],
    type: "problem",
  },
};

interface StoreTopic {
  id: number;
  title: string;
  creatorName: string;
}

// TODO: probably better to put userScores into a separate store (it doesn't seem necessary to
// couple scores with the nodes/edges, and we'd be able to avoid triggering score comparators by
// non-score-related changes), but a separate store will create the problem of separate undos/redos,
// and the need for another apiSyncer middleware? So it'll be nontrivial.
export type UserScores = Record<string, Record<string, Score>>; // userScores[:username][:graphPartId]

/**
 * If we're on the playground, hardcode "me." as the username. This:
 * - allows us to still use the userScores object in the store
 * - indicates that the scores are the creator's
 * - indicates that the user is not a real user, since "." is not a valid username character
 */
export const playgroundUsername = "me.";

export interface TopicStoreState {
  topic: StoreTopic | null;
  diagrams: Record<string, Diagram>;
  userScores: UserScores;
  activeTableProblemId: string | null;
  activeClaimTreeId: string | null;
  showImpliedEdges: boolean;
}

export const initialState: TopicStoreState = {
  topic: null,
  diagrams: initialDiagrams,
  userScores: {},
  activeTableProblemId: null,
  activeClaimTreeId: null,
  showImpliedEdges: true,
};

// should probably be "topic-playground-storage" but don't know how to migrate
export const topicStorePlaygroundName = "diagram-storage";

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useTopicStore = createWithEqualityFn<TopicStoreState>()(
  apiSyncer(
    temporal(
      persist(
        devtools(() => initialState),
        {
          name: topicStorePlaygroundName,
          version: 15,
          migrate: migrate,
          skipHydration: true,
        }
      )
    )
  ),
  Object.is // using `createWithEqualityFn` so that we can do shallow or deep diffs in hooks that return new arrays/objects so that we can avoid extra renders
);

export const useFilteredDiagram = (diagramId: string) => {
  return useTopicStore((state) => {
    const diagram = getDiagramOrThrow(state, diagramId);
    return filterHiddenComponents(diagram, getClaimTrees(state), state.showImpliedEdges);
  });
};

export const useDiagramType = (diagramId: string) => {
  return useTopicStore((state) => {
    // Zombie child issue, see https://github.com/amelioro/ameliorate/blob/main/docs/state-management.md#zombie-child-issue
    // batchedUpdates isn't necessary because react already batches updates as of react 18
    // Batching doesn't fix this though because the error isn't when rendering, it's when checking the store's comparers
    const diagram = getDiagram(state, diagramId);
    if (!diagram) return null;

    return diagram.type;
  });
};

export const useRootTitle = () => {
  return useTopicStore((state) => getTopicTitle(state));
};

export const useActiveClaimTreeId = () => {
  return useTopicStore((state) => state.activeClaimTreeId);
};

export const useActiveTableProblemId = () => {
  return useTopicStore((state) => state.activeTableProblemId);
};

export const useIsTableActive = () => {
  return useTopicStore(
    (state) => state.activeClaimTreeId === null && state.activeTableProblemId !== null
  );
};

export const useClaimTreesWithExplicitClaims = () => {
  return useTopicStore((state) =>
    Object.entries(state.diagrams)
      .filter(([id, diagram]) => id !== topicDiagramId && diagram.nodes.length > 1)
      .map(([id, diagram]) => [id, getDiagramTitle(diagram)] as [string, string])
  );
};

export const useShowImpliedEdges = () => {
  return useTopicStore((state) => state.showImpliedEdges);
};

export const useOnPlayground = () => {
  return useTopicStore((state) => state.topic === null);
};
