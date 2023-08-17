import { errorWithData } from "../../../common/errorHandling";
import { Diagram, getDiagramTitle, topicDiagramId } from "../utils/diagram";
import { TopicStoreState } from "./store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootDiagram = getTopicDiagram(state);
  return getDiagramTitle(rootDiagram);
};

export const getTopicDiagram = (state: TopicStoreState) => {
  return getDiagramOrThrow(state, topicDiagramId);
};

export const getDiagram = (state: TopicStoreState, diagramId: string) => {
  return state.diagrams[diagramId];
};

export const getDiagramOrThrow = (state: TopicStoreState, diagramId: string) => {
  const diagram = state.diagrams[diagramId];
  if (!diagram) throw errorWithData(`Diagram ${diagramId} not found in state`, state);

  return diagram;
};

export const getActiveDiagram = (state: TopicStoreState) => {
  const activeDiagramId = state.activeClaimTreeId ?? topicDiagramId;
  const activeDiagram = state.diagrams[activeDiagramId];

  if (!activeDiagram) throw errorWithData("Active diagram not found in state", state);

  return activeDiagram;
};

export const getClaimTrees = (state: TopicStoreState) => {
  return Object.values(state.diagrams).filter((diagram) => diagram.type === "claim");
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
