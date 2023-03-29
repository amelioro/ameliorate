import { problemDiagramId } from "../utils/diagram";
import { TopicStoreState } from "./store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootDiagram = state.diagrams[problemDiagramId];
  const rootProblem = rootDiagram.nodes[0];
  return rootProblem.data.label;
};

export const getActiveDiagram = (state: TopicStoreState) => {
  const activeDiagramId = state.activeClaimDiagramId ?? problemDiagramId;
  return state.diagrams[activeDiagramId];
};

export const getClaimDiagrams = (state: TopicStoreState) => {
  return Object.values(state.diagrams).filter((diagram) => diagram.type === "claim");
};
