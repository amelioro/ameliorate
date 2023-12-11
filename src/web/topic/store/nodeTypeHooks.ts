import { findGraphPart } from "../utils/graph";
import { useTopicStore } from "./store";

export const useQuestionDetails = (questionNodeId: string) => {
  return useTopicStore((state) => {
    try {
      const asksAboutEdge = state.edges.find(
        (edge) => edge.target === questionNodeId && edge.label === "asksAbout"
      );
      const partAskingAbout = asksAboutEdge
        ? findGraphPart(asksAboutEdge.source, state.nodes, state.edges)
        : null;

      const answerEdges = state.edges.filter(
        (edge) => edge.source === questionNodeId && edge.label === "potentialAnswerTo"
      );
      const answers = state.nodes.filter((node) =>
        answerEdges.some((edge) => edge.target === node.id)
      );

      return { partAskingAbout, answers };
    } catch {
      return { partAskingAbout: null, answers: [] };
    }
  });
};
