import { throwError } from "@/common/errorHandling";
import { Graph, findNodeOrThrow } from "@/web/topic/utils/graph";
import { children, parents } from "@/web/topic/utils/node";
import { TradeoffsOptions } from "@/web/view/utils/diagramFilter";

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
