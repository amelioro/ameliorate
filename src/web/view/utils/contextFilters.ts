import { throwError } from "@/common/errorHandling";
import { sourceNode, targetNode } from "@/web/topic/utils/edge";
import { Graph, findEdgeOrThrow, findNodeOrThrow } from "@/web/topic/utils/graph";
import { sourceNodes, targetNodes } from "@/web/topic/utils/node";
import { SolutionOptions, TradeoffsOptions } from "@/web/view/utils/infoFilter";

export const getSolutionContextFilter = (graph: Graph, solutionId: string): SolutionOptions => {
  const solution = findNodeOrThrow(solutionId, graph.nodes);

  return {
    type: "solution",
    centralSolutionId: solution.id,
  };
};

export const getCriterionContextFilter = (graph: Graph, criterionId: string): TradeoffsOptions => {
  const criterion = findNodeOrThrow(criterionId, graph.nodes);

  // If criterion is reused for two problems, we're arbitrarily just using one of the problems.
  // This is likely suboptimal. I think we should avoid reusing criteria... if there's a strong reason
  // to reuse, then we'll need to add a way to specify which problem we want to use.
  const problem =
    targetNodes(criterion, graph).find((target) => target.type === "problem") ??
    throwError("Criterion has no problem target node");

  const solutions = sourceNodes(problem, graph).filter((source) => source.type === "solution");

  return {
    type: "tradeoffs",
    centralProblemId: problem.id,
    solutionDetail: "connectedToCriteria",
    criteria: [criterion.id],
    solutions: solutions.map((solution) => solution.id),
  };
};

export const getFulfillsContextFilter = (
  graph: Graph,
  fulfillsEdgeId: string,
): TradeoffsOptions => {
  const fulfillsEdge = findEdgeOrThrow(fulfillsEdgeId, graph.edges);

  const solution = sourceNode(fulfillsEdge, graph.nodes);
  const criterion = targetNode(fulfillsEdge, graph.nodes);

  if (criterion.type !== "criterion" || solution.type !== "solution") {
    // e.g. benefit -fulfills-> criterion, which we don't want context for anyway
    throwError("Fulfills edge does not connect a solution to a criterion");
  }

  // If criterion is reused for two problems, we're arbitrarily just using one of the problems.
  // This is likely suboptimal. I think we should avoid reusing criteria... if there's a strong reason
  // to reuse, then we'll need to add a way to specify which problem we want to use.
  const problem =
    targetNodes(criterion, graph).find((target) => target.type === "problem") ??
    throwError("Criterion has no problem target node");

  return {
    type: "tradeoffs",
    centralProblemId: problem.id,
    solutionDetail: "connectedToCriteria",
    criteria: [criterion.id],
    solutions: [solution.id],
  };
};
