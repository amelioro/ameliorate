import { isEffect } from "@/common/node";
import { Graph, Node, upstreamNodes } from "@/web/topic/utils/graph";

/**
 * For determining layout and which nodes can be added from this node, we need to know if this
 * effect is created by a problem, solution, both, or neither.
 *
 * - e.g. solution detriments have mitigations instead of solutions
 * - e.g. solution effects are laid out below problem effects
 *
 * Note: "n/a" is used if we checked the effect type for a node that isn't an effect.
 */
export type EffectType = "problem" | "solution" | "problemAndSolution" | "neither" | "n/a";

export const getEffectType = (node: Node, graph: Graph): EffectType => {
  if (!isEffect(node.type)) return "n/a";

  const upstreamCauses = upstreamNodes(node, graph, ["causes"]);

  const causedByProblem = upstreamCauses.some((upstreamCause) => upstreamCause.type === "problem");
  const causedBySolution = upstreamCauses.some(
    (upstreamCause) =>
      upstreamCause.type === "solution" || upstreamCause.type === "solutionComponent",
  );

  if (causedByProblem && causedBySolution) return "problemAndSolution";
  if (causedByProblem) return "problem";
  if (causedBySolution) return "solution";

  return "neither";
};
