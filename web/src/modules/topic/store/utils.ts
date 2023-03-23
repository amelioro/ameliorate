import { TopicStoreState, problemDiagramId } from "./store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootDiagram = state.diagrams[problemDiagramId];
  const rootProblem = rootDiagram.nodes[0];
  return rootProblem.data.label;
};

export const getActiveDiagram = (state: TopicStoreState) => {
  const activeDiagramId = state.activeClaimDiagramId ?? problemDiagramId;
  return state.diagrams[activeDiagramId];
};
