import { isEffect } from "@/common/node";
import { Graph, Node, ancestors, descendants } from "@/web/topic/utils/graph";

/**
 * For determining layout and which nodes can be added from this node, we need to know if this
 * effect is created by a problem, solution, both, or neither.
 *
 * - e.g. solution effects create other effects via "creates" relations, but problem effects create
 * other effects via "createdBy" relations
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

  // Could rely on just edge "createdBy" vs "creates" rather than traversing relations, but then
  // mitigation effects wouldn't be distinguishable from solution effects.
  // Probably would be better to check createdBy/creates/causes for both problem and solution, or
  // ideally to just always only "causes" relations (https://github.com/amelioro/ameliorate/issues/787),
  // but this should be ok for now.
  // Note: technically the issue in this discussion is not covered until handling the above https://github.com/amelioro/ameliorate/discussions/579.
  const createdByProblem = ancestors(node, graph, ["createdBy"]).some(
    (ancestor) => ancestor.type === "problem",
  );
  const createdBySolution = descendants(node, graph, ["creates"]).some(
    (descendant) => descendant.type === "solution" || descendant.type === "solutionComponent",
  );

  if (createdByProblem && createdBySolution) return "problemAndSolution";
  if (createdByProblem) return "problem";
  if (createdBySolution) return "solution";

  return "neither";
};

export const isSolutionEffect = (effectType: EffectType): boolean => {
  return effectType === "solution" || effectType === "problemAndSolution";
};
