import { errorWithData } from "../../../common/errorHandling";
import { getDiagramTitle, topicDiagramId } from "../utils/diagram";
import { TopicStoreState, useTopicStore } from "./store";

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

/**
 * This is intended to allow mutation without issues, before calling setState
 * @returns a deep copy of the current topic store state
 */
export const getDuplicateState = () => {
  return JSON.parse(JSON.stringify(useTopicStore.getState())) as TopicStoreState;
};
