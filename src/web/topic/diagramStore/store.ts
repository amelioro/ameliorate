import { Topic as ApiTopic } from "@prisma/client";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import { temporal } from "zundo";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { apiSyncer } from "@/web/topic/diagramStore/apiSyncerMiddleware";
import { migrate } from "@/web/topic/diagramStore/migrate";
import { getDisplayScoresByGraphPartId } from "@/web/topic/diagramStore/scoreGetters";
import { Diagram } from "@/web/topic/utils/diagram";
import {
  Edge,
  Node,
  Score,
  buildNode,
  getRelevantEdges,
  getSecondaryNeighbors,
} from "@/web/topic/utils/graph";
import {
  useGeneralFilter,
  useInfoFilter,
  useShowImpliedEdges,
  useShowProblemCriterionSolutionEdges,
} from "@/web/view/currentViewStore/filter";
import { usePerspectives } from "@/web/view/perspectiveStore";
import { applyNodeTypeFilter, applyScoreFilter } from "@/web/view/utils/generalFilter";
import { applyInfoFilter } from "@/web/view/utils/infoFilter";
import {
  hideImpliedEdges,
  hideProblemCriterionSolutionEdges,
} from "@/web/view/utils/miscDiagramFilters";

export interface PlaygroundTopic {
  id: undefined; // so we can check this to see if the store topic is a playground topic
  description: string;
}

export type StoreTopic = ApiTopic | PlaygroundTopic;

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

export interface TopicStoreState {
  topic: StoreTopic;
  nodes: Node[];
  edges: Edge[];
  userScores: UserScores;
}

export const initialState: TopicStoreState = {
  topic: { id: undefined, description: "" },
  nodes: [buildNode({ type: "problem" })],
  edges: [],
  userScores: {},
};

// should probably be "topic-playground-storage" but don't know how to migrate
export const topicStorePlaygroundName = "diagram-storage";

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useTopicStore = createWithEqualityFn<TopicStoreState>()(
  apiSyncer(
    persist(temporal(devtools(() => initialState, { name: topicStorePlaygroundName })), {
      name: topicStorePlaygroundName,
      version: 24,
      migrate: migrate,
      skipHydration: true,
    }),
  ),
  Object.is, // using `createWithEqualityFn` so that we can do shallow or deep diffs in hooks that return new arrays/objects so that we can avoid extra renders
);

export const useDiagram = (): Diagram => {
  const infoFilter = useInfoFilter();
  const generalFilter = useGeneralFilter();

  const showImpliedEdges = useShowImpliedEdges();
  const showProblemCriterionSolutionEdges = useShowProblemCriterionSolutionEdges();
  const perspectives = usePerspectives();

  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };

    const nodesAfterDiagramFilter = applyInfoFilter(topicGraph, infoFilter);

    const nodesAfterTypeFilter = applyNodeTypeFilter(
      nodesAfterDiagramFilter,
      generalFilter.nodeTypes,
    );

    // don't filter edges because hard to prevent awkwardness when edge doesn't pass filter and suddenly nodes are scattered
    const partIdsForScores = state.nodes.map((part) => part.id);
    const scores = getDisplayScoresByGraphPartId(partIdsForScores, perspectives, state.userScores);
    const nodesAfterScoreFilter = applyScoreFilter(nodesAfterTypeFilter, generalFilter, scores);

    const nodesToShow = state.nodes.filter((node) => generalFilter.nodesToShow.includes(node.id));
    const nodesAfterToShow = uniqBy(nodesAfterScoreFilter.concat(nodesToShow), "id");

    const secondaryNeighbors = getSecondaryNeighbors(nodesAfterToShow, topicGraph, generalFilter);

    const nodesBeforeHide = nodesAfterToShow.concat(secondaryNeighbors);
    const nodesAfterHide = nodesBeforeHide.filter(
      (node) => !generalFilter.nodesToHide.includes(node.id),
    );

    const nodes = uniqBy(nodesAfterHide, "id");

    const relevantEdges = getRelevantEdges(nodes, topicGraph);
    const edgesAfterImplied = showImpliedEdges
      ? relevantEdges
      : hideImpliedEdges(relevantEdges, { nodes, edges: relevantEdges }, topicGraph);

    const edges = showProblemCriterionSolutionEdges
      ? edgesAfterImplied
      : hideProblemCriterionSolutionEdges(nodes, edgesAfterImplied);

    // sort nodes/edges to ensure layout doesn't change if nodes/edges occur in a different order
    return { nodes: sortBy(nodes, "id"), edges: sortBy(edges, "id") };
  });
};
