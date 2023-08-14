import { type Topic } from "@prisma/client";
import throttle from "lodash/throttle";
import { temporal } from "zundo";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  Diagram,
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

type StoreTopic = Omit<Topic, "createdAt" | "updatedAt">;

export interface TopicStoreState {
  topic: StoreTopic | null;
  diagrams: Record<string, Diagram>;
  activeTableProblemId: string | null;
  activeClaimTreeId: string | null;
  showImpliedEdges: boolean;
}

export const initialState: TopicStoreState = {
  topic: null,
  diagrams: initialDiagrams,
  activeTableProblemId: null,
  activeClaimTreeId: null,
  showImpliedEdges: true,
};

// should probably be "topic-playground-storage" but don't know how to migrate
export const topicStorePlaygroundName = "diagram-storage";

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useTopicStore = create<TopicStoreState>()(
  apiSyncer(
    temporal(
      persist(
        devtools(() => initialState),
        {
          name: topicStorePlaygroundName,
          version: 14,
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

export const useDiagram = (diagramId: string) => {
  return useTopicStore((state) => state.diagrams[diagramId]);
};

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

// topic view id is the claim tree id or topic diagram id
export const useTopicViewId = () => {
  return useTopicStore(
    (state) => state.activeClaimTreeId ?? state.activeTableProblemId ?? topicDiagramId
  );
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
