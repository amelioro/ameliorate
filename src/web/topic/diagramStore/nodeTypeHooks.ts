import { useTopicStore } from "@/web/topic/diagramStore/store";
import { findGraphPartOrThrow, findNodeOrThrow } from "@/web/topic/utils/graph";

export const useIsMitigatableDetriment = (nodeId: string) => {
  return useTopicStore((state) => {
    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      // is mitigatable if it's created by a solution or mitigation
      return (
        node.type === "detriment" &&
        state.edges.find(
          (edge) =>
            (edge.source === nodeId && edge.label === "creates") ||
            // Rare case where detriment is below a solution; this can exist while this discussion is still unresolved https://github.com/amelioro/ameliorate/discussions/579.
            // This case could technically exist for more situations e.g. detriment created by a solution component,
            // but not going to spend effort on that until the mentioned discussion determines that such a case is important to cover.
            (edge.target === nodeId &&
              edge.label === "createdBy" &&
              state.nodes.find((node) => node.id === edge.source)?.type === "solution"),
        ) !== undefined
      );
    } catch {
      return false;
    }
  });
};

export const useQuestionDetails = (questionNodeId: string) => {
  return useTopicStore((state) => {
    try {
      const asksAboutEdge = state.edges.find(
        (edge) => edge.target === questionNodeId && edge.label === "asksAbout",
      );
      const partAskingAbout = asksAboutEdge
        ? findGraphPartOrThrow(asksAboutEdge.source, state.nodes, state.edges)
        : null;

      const answerEdges = state.edges.filter(
        (edge) => edge.source === questionNodeId && edge.label === "potentialAnswerTo",
      );
      const answers = state.nodes.filter((node) =>
        answerEdges.some((edge) => edge.target === node.id),
      );

      return { partAskingAbout, answers };
    } catch {
      return { partAskingAbout: null, answers: [] };
    }
  });
};

export const useAnswerDetails = (answerNodeId: string) => {
  return useTopicStore((state) => {
    try {
      const answerToEdge = state.edges.find(
        (edge) => edge.target === answerNodeId && edge.label === "potentialAnswerTo",
      );
      const question = answerToEdge ? findNodeOrThrow(answerToEdge.source, state.nodes) : null;
      return { question };
    } catch {
      return { question: null };
    }
  });
};

export const useFactDetails = (factNodeId: string) => {
  return useTopicStore((state) => {
    const relevantForEdges = state.edges.filter(
      (edge) => edge.target === factNodeId && edge.label === "relevantFor",
    );

    const nodesRelevantFor = state.nodes.filter((node) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.source === node.id),
    );
    const edgesRelevantFor = state.edges.filter((edge) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.source === edge.id),
    );

    const sourceEdges = state.edges.filter(
      (edge) => edge.source === factNodeId && edge.label === "sourceOf",
    );
    const sources = state.nodes.filter((node) =>
      sourceEdges.some((sourceEdge) => node.id === sourceEdge.target),
    );

    return { nodesRelevantFor, edgesRelevantFor, sources };
  });
};

export const useSourceDetails = (sourceNodeId: string) => {
  return useTopicStore((state) => {
    const relevantForEdges = state.edges.filter(
      (edge) => edge.target === sourceNodeId && edge.label === "relevantFor",
    );

    const nodesRelevantFor = state.nodes.filter((node) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.source === node.id),
    );
    const edgesRelevantFor = state.edges.filter((edge) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.source === edge.id),
    );

    const factEdges = state.edges.filter(
      (edge) => edge.target === sourceNodeId && edge.label === "sourceOf",
    );
    const facts = state.nodes.filter((node) =>
      factEdges.some((factEdge) => node.id === factEdge.source),
    );

    const mentionEdges = state.edges.filter(
      (edge) => edge.target === sourceNodeId && edge.label === "mentions",
    );
    const sources = state.nodes.filter((node) =>
      mentionEdges.some((mentionEdge) => node.id === mentionEdge.source),
    );

    return { nodesRelevantFor, edgesRelevantFor, facts, sources };
  });
};
