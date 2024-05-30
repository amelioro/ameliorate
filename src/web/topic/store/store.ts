import uniqBy from "lodash/uniqBy";
import { temporal } from "zundo";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { apiSyncer } from "@/web/topic/store/apiSyncerMiddleware";
import { migrate } from "@/web/topic/store/migrate";
import { getDisplayScoresByGraphPartId } from "@/web/topic/store/scoreGetters";
import { Diagram } from "@/web/topic/utils/diagram";
import { hideImpliedEdges } from "@/web/topic/utils/edge";
import {
  Edge,
  Node,
  Score,
  buildNode,
  getRelevantEdges,
  getSecondaryNeighbors,
} from "@/web/topic/utils/graph";
import {
  useDiagramFilter,
  useGeneralFilter,
  useShowImpliedEdges,
} from "@/web/view/currentViewStore/filter";
import { usePerspectives } from "@/web/view/perspectiveStore";
import { applyDiagramFilter } from "@/web/view/utils/diagramFilter";
import { applyNodeTypeFilter, applyScoreFilter } from "@/web/view/utils/generalFilter";

export interface PlaygroundTopic {
  id: undefined; // so we can check this to see if the store topic is a playground topic
  description: string;
}

export type UserTopic = Omit<PlaygroundTopic, "id"> & {
  id: number;
  creatorName: string;
  title: string;
};

export type StoreTopic = UserTopic | PlaygroundTopic;

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
      version: 23,
      migrate: migrate,
      skipHydration: true,
    })
  ),
  Object.is // using `createWithEqualityFn` so that we can do shallow or deep diffs in hooks that return new arrays/objects so that we can avoid extra renders
);

export const useDiagram = (): Diagram => {
  const diagramFilter = useDiagramFilter();
  const generalFilter = useGeneralFilter();

  const showImpliedEdges = useShowImpliedEdges();
  const perspectives = usePerspectives();

  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };

    const nodesAfterDiagramFilter = applyDiagramFilter(topicGraph, diagramFilter);

    const nodesAfterTypeFilter = applyNodeTypeFilter(
      nodesAfterDiagramFilter,
      generalFilter.nodeTypes
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
      (node) => !generalFilter.nodesToHide.includes(node.id)
    );

    const nodes = uniqBy(nodesAfterHide, "id");

    const relevantEdges = getRelevantEdges(nodes, topicGraph);
    const edges = showImpliedEdges
      ? relevantEdges
      : hideImpliedEdges(relevantEdges, { nodes, edges: relevantEdges }, topicGraph);

    return { nodes, edges };
  });
};
