import { claimRelationNames, topicRelationNames } from "../../../common/edge";
import { claimNodeTypes, topicNodeTypes } from "../../../common/node";
import { Diagram, getDiagramTitle } from "../utils/diagram";
import { Edge, Graph } from "../utils/graph";
import { PlaygroundTopic, StoreTopic, TopicStoreState } from "./store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootDiagram = getTopicDiagram(state);
  return getDiagramTitle(rootDiagram);
};

export const getActiveDiagram = (state: TopicStoreState): Diagram => {
  const topicGraph = { nodes: state.nodes, edges: state.edges };
  if (state.activeClaimTreeId) return getClaimTree(topicGraph, state.activeClaimTreeId);
  else return getTopicDiagram(topicGraph);
};

export const getTopicDiagram = (topicGraph: Graph): Diagram => {
  return {
    nodes: topicGraph.nodes.filter((node) => topicNodeTypes.includes(node.type)),
    edges: topicGraph.edges.filter((edge) => topicRelationNames.includes(edge.label)),
    orientation: "DOWN",
    type: "topicDiagram",
  };
};

export const getClaimTree = (topicGraph: Graph, arguedDiagramPartId: string): Diagram => {
  return {
    nodes: topicGraph.nodes.filter(
      (node) =>
        claimNodeTypes.includes(node.type) && node.data.arguedDiagramPartId === arguedDiagramPartId
    ),
    edges: topicGraph.edges.filter(
      (edge) =>
        claimRelationNames.includes(edge.label) &&
        edge.data.arguedDiagramPartId === arguedDiagramPartId
    ),
    orientation: "RIGHT",
    type: "claimTree",
  };
};

export const getClaimEdges = (edges: Edge[]) => {
  return edges.filter((edge) => topicRelationNames.includes(edge.label));
};

export const setSelected = (graphPartId: string, topicGraph: Graph) => {
  /* eslint-disable functional/immutable-data, no-param-reassign */
  topicGraph.nodes.forEach((node) => {
    if (node.id === graphPartId && !node.selected) node.selected = true;
    if (node.id !== graphPartId && node.selected) node.selected = false;
  });

  topicGraph.edges.forEach((edge) => {
    if (edge.id === graphPartId && !edge.selected) edge.selected = true;
    if (edge.id !== graphPartId && edge.selected) edge.selected = false;
  });
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
