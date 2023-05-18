import { errorWithData } from "../../../common/errorHandling";
import { getDiagramTitle, problemDiagramId } from "../utils/diagram";
import { TopicStoreState, useTopicStore } from "./store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootDiagram = getProblemDiagram(state);
  return getDiagramTitle(rootDiagram);
};

export const getProblemDiagram = (state: TopicStoreState) => {
  return getDiagramOrThrow(state, problemDiagramId);
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
  const activeDiagramId = state.activeClaimDiagramId ?? problemDiagramId;
  const activeDiagram = state.diagrams[activeDiagramId];

  if (!activeDiagram) throw errorWithData("Active diagram not found in state", state);

  return activeDiagram;
};

export const getClaimDiagrams = (state: TopicStoreState) => {
  return Object.values(state.diagrams).filter((diagram) => diagram.type === "claim");
};

/**
 * This is intended to allow mutation without issues, before calling setState
 * @returns a deep copy of the current topic store state
 */
export const getDuplicateState = () => {
  return JSON.parse(JSON.stringify(useTopicStore.getState())) as TopicStoreState;
};
