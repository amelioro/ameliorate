import { claimRelationNames, exploreRelationNames, topicRelationNames } from "../../../common/edge";
import { claimNodeTypes, exploreNodeTypes, topicNodeTypes } from "../../../common/node";
import { Diagram, getDiagramTitle } from "../utils/diagram";
import { Edge, Graph } from "../utils/graph";
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
  return {
    nodes: topicGraph.nodes.filter((node) => exploreNodeTypes.includes(node.type)),
    edges: topicGraph.edges.filter((edge) => exploreRelationNames.includes(edge.label)),
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

export const getClaimEdges = (edges: Edge[]) => {
  return edges.filter((edge) => topicRelationNames.includes(edge.label));
};

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
