import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { EffectType, getEffectType } from "@/web/topic/utils/effect";
import { findGraphPartOrThrow, findNodeOrThrow } from "@/web/topic/utils/graph";

export const useEffectType = (nodeId: string): EffectType => {
  return useDiagramStore((state) => {
    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      return getEffectType(node, { nodes: state.nodes, edges: state.edges });
    } catch {
      return "n/a";
    }
  });
};

export const useQuestionDetails = (questionNodeId: string) => {
  return useDiagramStore((state) => {
    try {
      const asksAboutEdge = state.edges.find(
        (edge) => edge.source === questionNodeId && edge.label === "asksAbout",
      );
      const partAskingAbout = asksAboutEdge
        ? findGraphPartOrThrow(asksAboutEdge.target, state.nodes, state.edges)
        : null;

      const answerEdges = state.edges.filter(
        (edge) => edge.target === questionNodeId && edge.label === "potentialAnswerTo",
      );
      const answers = state.nodes.filter((node) =>
        answerEdges.some((edge) => edge.source === node.id),
      );

      return { partAskingAbout, answers };
    } catch {
      return { partAskingAbout: null, answers: [] };
    }
  });
};

export const useAnswerDetails = (answerNodeId: string) => {
  return useDiagramStore((state) => {
    try {
      const answerToEdge = state.edges.find(
        (edge) => edge.source === answerNodeId && edge.label === "potentialAnswerTo",
      );
      const question = answerToEdge ? findNodeOrThrow(answerToEdge.target, state.nodes) : null;
      return { question };
    } catch {
      return { question: null };
    }
  });
};

export const useFactDetails = (factNodeId: string) => {
  return useDiagramStore((state) => {
    const relevantForEdges = state.edges.filter(
      (edge) => edge.source === factNodeId && edge.label === "relevantFor",
    );

    const nodesRelevantFor = state.nodes.filter((node) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.target === node.id),
    );
    const edgesRelevantFor = state.edges.filter((edge) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.target === edge.id),
    );

    const sourceEdges = state.edges.filter(
      (edge) => edge.target === factNodeId && edge.label === "sourceOf",
    );
    const sources = state.nodes.filter((node) =>
      sourceEdges.some((sourceEdge) => node.id === sourceEdge.source),
    );

    return { nodesRelevantFor, edgesRelevantFor, sources };
  });
};

export const useSourceDetails = (sourceNodeId: string) => {
  return useDiagramStore((state) => {
    const relevantForEdges = state.edges.filter(
      (edge) => edge.source === sourceNodeId && edge.label === "relevantFor",
    );

    const nodesRelevantFor = state.nodes.filter((node) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.target === node.id),
    );
    const edgesRelevantFor = state.edges.filter((edge) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.target === edge.id),
    );

    const factEdges = state.edges.filter(
      (edge) => edge.source === sourceNodeId && edge.label === "sourceOf",
    );
    const facts = state.nodes.filter((node) =>
      factEdges.some((factEdge) => node.id === factEdge.target),
    );

    const mentionEdges = state.edges.filter(
      (edge) => edge.source === sourceNodeId && edge.label === "mentions",
    );
    const mentionedSources = state.nodes.filter((node) =>
      mentionEdges.some((mentionEdge) => node.id === mentionEdge.target),
    );

    return { nodesRelevantFor, edgesRelevantFor, facts, mentionedSources };
  });
};
