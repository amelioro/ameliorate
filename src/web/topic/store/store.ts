import { temporal } from "zundo";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { useShowImpliedEdges } from "../../view/actionConfigStore";
import { useFilterOptions } from "../../view/navigateStore";
import { usePerspectives } from "../../view/perspectiveStore";
import {
  applyNodeTypeFilter,
  applyScoreFilter,
  applyStandardFilter,
} from "../../view/utils/filter";
import { Diagram } from "../utils/diagram";
import { hideImpliedEdges } from "../utils/edge";
import {
  Edge,
  Node,
  Score,
  buildNode,
  getRelevantEdges,
  getSecondaryNeighbors,
} from "../utils/graph";
import { apiSyncer } from "./apiSyncerMiddleware";
import { migrate } from "./migrate";
import { getDisplayScores } from "./scoreGetters";
import { getClaimTree, getResearchDiagram, getTopicDiagram } from "./utils";

export interface PlaygroundTopic {
  id: undefined; // so we can check this to see if the store topic is a playground topic
  title: string;
  description: string;
}

export type UserTopic = Omit<PlaygroundTopic, "id"> & {
  id: number;
  creatorName: string;
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
export const playgroundUsername = "me.";

export interface TopicStoreState {
  topic: StoreTopic;
  nodes: Node[];
  edges: Edge[];
  userScores: UserScores;
}

export const initialState: TopicStoreState = {
  topic: { id: undefined, title: "", description: "" },
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
    temporal(
      persist(
        devtools(() => initialState),
        {
          name: topicStorePlaygroundName,
          version: 21,
          migrate: migrate,
          skipHydration: true,
        }
      )
    )
  ),
  Object.is // using `createWithEqualityFn` so that we can do shallow or deep diffs in hooks that return new arrays/objects so that we can avoid extra renders
);

export const useTopicDiagram = (): Diagram => {
  const showImpliedEdges = useShowImpliedEdges();
  const filterOptions = useFilterOptions("topicDiagram");
  const perspectives = usePerspectives();

  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };
    const topicDiagram = getTopicDiagram(topicGraph);

    const { nodes: filteredPrimaryNodes } = applyStandardFilter(topicDiagram, filterOptions);
    const nodesAfterTypeFilter = applyNodeTypeFilter(filteredPrimaryNodes, filterOptions.nodeTypes);

    const partIdsForScores = state.nodes.map((part) => part.id);
    const scores = getDisplayScores(partIdsForScores, perspectives, state.userScores);
    const nodesAfterScoreFilter = applyScoreFilter(nodesAfterTypeFilter, filterOptions, scores);

    const secondaryNeighbors = filterOptions.showSecondaryNeighbors
      ? getSecondaryNeighbors(nodesAfterScoreFilter, topicGraph, "topicDiagram")
      : [];
    const nodes = nodesAfterScoreFilter.concat(secondaryNeighbors);

    const relevantEdges = getRelevantEdges(nodes, topicGraph);
    // don't filter edges because hard to prevent awkwardness when edge doesn't pass filter and suddenly nodes are scattered
    const edges = showImpliedEdges
      ? relevantEdges
      : hideImpliedEdges(relevantEdges, { nodes, edges: relevantEdges }, topicGraph);

    return { nodes, edges, orientation: "DOWN", type: "topicDiagram" };
  });
};

export const useResearchDiagram = (): Diagram => {
  const filterOptions = useFilterOptions("researchDiagram");
  const perspectives = usePerspectives();

  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };
    const researchDiagram = getResearchDiagram(topicGraph);

    const { nodes: filteredPrimaryNodes } = applyStandardFilter(researchDiagram, filterOptions);
    const nodesAfterTypeFilter = applyNodeTypeFilter(filteredPrimaryNodes, filterOptions.nodeTypes);

    const partIdsForScores = state.nodes.map((part) => part.id);
    const scores = getDisplayScores(partIdsForScores, perspectives, state.userScores);
    const nodesAfterScoreFilter = applyScoreFilter(nodesAfterTypeFilter, filterOptions, scores);

    const secondaryNeighbors = filterOptions.showSecondaryNeighbors
      ? getSecondaryNeighbors(nodesAfterScoreFilter, topicGraph, "researchDiagram")
      : [];
    const nodes = nodesAfterScoreFilter.concat(secondaryNeighbors);

    // don't filter edges because hard to prevent awkwardness when edge doesn't pass filter and suddenly nodes are scattered
    const edges = getRelevantEdges(nodes, topicGraph);

    return { nodes, edges, orientation: "DOWN", type: "researchDiagram" };
  });
};

export const useClaimTree = (arguedDiagramPartId: string): Diagram => {
  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };
    return getClaimTree(topicGraph, arguedDiagramPartId);
  });
};

export const useClaimTreesWithExplicitClaims = () => {
  return useTopicStore((state) => {
    const rootNodes = state.nodes.filter(
      (node) => node.type === "rootClaim" && state.edges.some((edge) => edge.source === node.id)
    );

    return rootNodes.map(
      (node) => [node.data.arguedDiagramPartId, node.data.label] as [string, string]
    );
  });
};
