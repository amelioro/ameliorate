import { isEffect } from "@/common/node";
import { Graph, Node, ancestors, descendants } from "@/web/topic/utils/graph";

/**
 * For determining layout and which nodes can be added from this node, we need to know if this
 * effect is caused by a problem, solution, both, or neither.

 * - e.g. solution effects cause other effects via "causes" relations, but problem effects cause
 * other effects via incoming "causes" relations from problems
 * - e.g. solution detriments have mitigations instead of solutions
 * - e.g. solution effects are laid out below problem effects
 *
 * Note: "n/a" is used if we checked the effect type for a node that isn't an effect.
 *
 * TODO: if we made all edge labels read from source to target and without using "X by" (e.g.
 * "created by"), then we wouldn't need this for the first example (creating relations).
 */
export type EffectType = "problem" | "solution" | "problemAndSolution" | "neither" | "n/a";

export const getEffectType = (node: Node, graph: Graph): EffectType => {
  if (!isEffect(node.type)) return "n/a";

  const causedByProblem = ancestors(node, graph, ["causes"]).some(
    (ancestor) => ancestor.type === "problem",
  );
  const causedBySolution = descendants(node, graph, ["causes"]).some(
    (descendant) => descendant.type === "solution" || descendant.type === "solutionComponent",
  );

  if (causedByProblem && causedBySolution) return "problemAndSolution";
  if (causedByProblem) return "problem";
  if (causedBySolution) return "solution";

  return "neither";
};
