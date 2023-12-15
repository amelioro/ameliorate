import { claimRelationNames, exploreRelationNames, topicRelationNames } from "../../../common/edge";
import { claimNodeTypes, exploreNodeTypes, topicNodeTypes } from "../../../common/node";
import { Diagram, getDiagramTitle } from "../utils/diagram";
import { Graph } from "../utils/graph";
import { PlaygroundTopic, StoreTopic, TopicStoreState } from "./store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootDiagram = getTopicDiagram(state);
  return getDiagramTitle(rootDiagram);
};

export const getTopicDiagram = (topicGraph: Graph): Diagram => {
  return {
    nodes: topicGraph.nodes.filter((node) => topicNodeTypes.includes(node.type)),
    edges: topicGraph.edges.filter((edge) => topicRelationNames.includes(edge.label)),
    orientation: "DOWN",
    type: "topicDiagram",
  };
};

export const getExploreDiagram = (topicGraph: Graph): Diagram => {
  const edges = topicGraph.edges.filter((edge) => exploreRelationNames.includes(edge.label));
  const nodes = topicGraph.nodes.filter(
    (node) =>
      exploreNodeTypes.includes(node.type) ||
      // show contextual nodes (e.g. problem node that a question points at)
      edges.some((edge) => edge.source === node.id || edge.target === node.id)
  );

  return {
    nodes,
    edges,
    orientation: "DOWN",
    type: "exploreDiagram",
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

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
