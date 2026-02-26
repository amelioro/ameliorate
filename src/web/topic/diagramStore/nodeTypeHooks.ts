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
        (edge) => edge.sourceId === questionNodeId && edge.type === "asksAbout",
      );
      const partAskingAbout = asksAboutEdge
        ? findGraphPartOrThrow(asksAboutEdge.targetId, state.nodes, state.edges)
        : null;

      const answerEdges = state.edges.filter(
        (edge) => edge.targetId === questionNodeId && edge.type === "potentialAnswerTo",
      );
      const answers = state.nodes.filter((node) =>
        answerEdges.some((edge) => edge.sourceId === node.id),
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
        (edge) => edge.sourceId === answerNodeId && edge.type === "potentialAnswerTo",
      );
      const question = answerToEdge ? findNodeOrThrow(answerToEdge.targetId, state.nodes) : null;
      return { question };
    } catch {
      return { question: null };
    }
  });
};

export const useFactDetails = (factNodeId: string) => {
  return useDiagramStore((state) => {
    const relevantForEdges = state.edges.filter(
      (edge) => edge.sourceId === factNodeId && edge.type === "relevantFor",
    );

    const nodesRelevantFor = state.nodes.filter((node) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.targetId === node.id),
    );
    const edgesRelevantFor = state.edges.filter((edge) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.targetId === edge.id),
    );

    const sourceEdges = state.edges.filter(
      (edge) => edge.targetId === factNodeId && edge.type === "sourceOf",
    );
    const sources = state.nodes.filter((node) =>
      sourceEdges.some((sourceEdge) => node.id === sourceEdge.sourceId),
    );

    return { nodesRelevantFor, edgesRelevantFor, sources };
  });
};

export const useSourceDetails = (sourceNodeId: string) => {
  return useDiagramStore((state) => {
    const relevantForEdges = state.edges.filter(
      (edge) => edge.sourceId === sourceNodeId && edge.type === "relevantFor",
    );

    const nodesRelevantFor = state.nodes.filter((node) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.targetId === node.id),
    );
    const edgesRelevantFor = state.edges.filter((edge) =>
      relevantForEdges.some((relevantForEdge) => relevantForEdge.targetId === edge.id),
    );

    const factEdges = state.edges.filter(
      (edge) => edge.sourceId === sourceNodeId && edge.type === "sourceOf",
    );
    const facts = state.nodes.filter((node) =>
      factEdges.some((factEdge) => node.id === factEdge.targetId),
    );

    const mentionEdges = state.edges.filter(
      (edge) => edge.sourceId === sourceNodeId && edge.type === "mentions",
    );
    const mentionedSources = state.nodes.filter((node) =>
      mentionEdges.some((mentionEdge) => node.id === mentionEdge.targetId),
    );

    return { nodesRelevantFor, edgesRelevantFor, facts, mentionedSources };
  });
};
