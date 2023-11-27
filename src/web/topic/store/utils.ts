import { topicRelationNames } from "../../../common/edge";
import { topicNodeTypes } from "../../../common/node";
import { Diagram, Edge, Graph, getDiagramTitle } from "../utils/diagram";
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
    nodes: topicGraph.nodes.filter((node) => node.data.arguedDiagramPartId === arguedDiagramPartId),
    edges: topicGraph.edges.filter((edge) => edge.data.arguedDiagramPartId === arguedDiagramPartId),
    orientation: "RIGHT",
    type: "claimTree",
  };
};

export const getClaimEdges = (edges: Edge[]) => {
  return edges.filter((edge) => topicRelationNames.includes(edge.label));
};

export const setSelected = (graphPartId: string, diagram: Diagram) => {
  /* eslint-disable functional/immutable-data, no-param-reassign */
  diagram.nodes = diagram.nodes.map((node) => {
    // only shallow copy node if we have to, since re-renders will occur on Object change
    if (node.id === graphPartId && !node.selected) return { ...node, selected: true };
    if (node.id !== graphPartId && node.selected) return { ...node, selected: false };
    return node;
  });

  diagram.edges = diagram.edges.map((edge) => {
    // only shallow copy node if we have to, since re-renders will occur on Object change
    if (edge.id === graphPartId && !edge.selected) return { ...edge, selected: true };
    if (edge.id !== graphPartId && edge.selected) return { ...edge, selected: false };
    return edge;
  });
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
