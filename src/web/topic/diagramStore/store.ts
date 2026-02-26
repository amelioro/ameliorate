import { temporal } from "zundo";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { apiSyncer } from "@/web/topic/diagramStore/apiSyncerMiddleware";
import { migrate } from "@/web/topic/diagramStore/migrate";
import { Edge, Node, Score, buildNode } from "@/web/topic/utils/graph";

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
export const playgroundUsername = "playground.user";

export interface DiagramStoreState {
  nodes: Node[];
  edges: Edge[];
  userScores: UserScores;
}

export const initialState: DiagramStoreState = {
  nodes: [buildNode({ type: "problem" })],
  edges: [],
  userScores: {},
};

export const diagramStorePlaygroundName = "diagram-storage";
export const currentDiagramVersion = 28;

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useDiagramStore = createWithEqualityFn<DiagramStoreState>()(
  apiSyncer(
    persist(temporal(devtools(() => initialState, { name: diagramStorePlaygroundName })), {
      name: diagramStorePlaygroundName,
      version: currentDiagramVersion,
      migrate: migrate,
      skipHydration: true,
    }),
  ),
  Object.is, // using `createWithEqualityFn` so that we can do shallow or deep diffs in hooks that return new arrays/objects so that we can avoid extra renders
);
