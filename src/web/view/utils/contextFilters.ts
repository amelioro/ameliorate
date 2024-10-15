import { throwError } from "@/common/errorHandling";
import { childNode, parentNode } from "@/web/topic/utils/edge";
import { Graph, findEdgeOrThrow, findNodeOrThrow } from "@/web/topic/utils/graph";
import { children, parents } from "@/web/topic/utils/node";
import { SolutionOptions, TradeoffsOptions } from "@/web/view/utils/diagramFilter";

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
    parents(criterion, graph).find((parent) => parent.type === "problem") ??
    throwError("Criterion has no problem parent");

  const solutions = children(problem, graph).filter((child) => child.type === "solution");

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

  const criterion = parentNode(fulfillsEdge, graph.nodes);
  const solution = childNode(fulfillsEdge, graph.nodes);

  if (criterion.type !== "criterion" || solution.type !== "solution") {
    // e.g. benefit -fulfills-> criterion, which we don't want context for anyway
    throwError("Fulfills edge does not connect a criterion to a solution");
  }

  // If criterion is reused for two problems, we're arbitrarily just using one of the problems.
  // This is likely suboptimal. I think we should avoid reusing criteria... if there's a strong reason
  // to reuse, then we'll need to add a way to specify which problem we want to use.
  const problem =
    parents(criterion, graph).find((parent) => parent.type === "problem") ??
    throwError("Criterion has no problem parent");

  return {
    type: "tradeoffs",
    centralProblemId: problem.id,
    solutionDetail: "connectedToCriteria",
    criteria: [criterion.id],
    solutions: [solution.id],
  };
};
