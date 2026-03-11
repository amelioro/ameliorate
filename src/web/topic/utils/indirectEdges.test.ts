/**
 * All tests here are visualized in this tldraw https://www.tldraw.com/f/HbjLy3_YHi58nNFBlXFoY?d=v-14010.-2644.31736.15058.page
 */

import { describe, expect, test } from "vitest";

import { MinimalEdge } from "@/common/edge";
import { MinimalGraph } from "@/common/graph";
import { MinimalNode } from "@/common/node";
import { buildEdge, buildNode } from "@/web/topic/utils/graph";
import { IndirectEdge, getIndirectEdges } from "@/web/topic/utils/indirectEdges";

const buildIndirectEdge = (
  source: MinimalNode,
  type: IndirectEdge["type"],
  target: MinimalNode,
  hiddenPath: MinimalEdge[],
): IndirectEdge => {
  return {
    id: `${source.id}..${type}..${target.id}`,
    sourceId: source.id,
    targetId: target.id,
    type,
    data: {
      hiddenPath,
    },
  };
};

describe("getIndirectEdges", () => {
  describe("basic cases", () => {
    test("'has', 'causes', 'relates to' are transitive", () => {
      // "causes" chain
      const cause1 = buildNode({ type: "cause", text: "cause 1" });
      const cause2 = buildNode({ type: "cause", text: "cause 2" });
      const problem = buildNode({ type: "problem", text: "problem" });

      const cause1_causes_cause2 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause2.id,
      });
      const cause2_causes_problem = buildEdge({
        sourceId: cause2.id,
        relation: "causes",
        targetId: problem.id,
      });

      // "has" chain
      const solution = buildNode({ type: "solution", text: "solution" });
      const component1 = buildNode({ type: "solutionComponent", text: "component 1" });
      const component2 = buildNode({ type: "solutionComponent", text: "component 2" });

      const solution_has_component1 = buildEdge({
        sourceId: solution.id,
        relation: "has",
        targetId: component1.id,
      });
      const component1_has_component2 = buildEdge({
        sourceId: component1.id,
        relation: "has",
        targetId: component2.id,
      });

      // "relates to" chain
      const customA = buildNode({ type: "custom", text: "custom a" });
      const customB = buildNode({ type: "custom", text: "custom b" });
      const customC = buildNode({ type: "custom", text: "custom c" });

      const customA_relatesTo_customB = buildEdge({
        sourceId: customA.id,
        relation: "relatesTo",
        targetId: customB.id,
      });
      const customB_relatesTo_customC = buildEdge({
        sourceId: customB.id,
        relation: "relatesTo",
        targetId: customC.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [
          cause1,
          cause2,
          problem,
          solution,
          component1,
          component2,
          customA,
          customB,
          customC,
        ],
        edges: [
          cause1_causes_cause2,
          cause2_causes_problem,
          solution_has_component1,
          component1_has_component2,
          customA_relatesTo_customB,
          customB_relatesTo_customC,
        ],
      };

      // Hide cause2, component1, customB
      const displayedDiagram: MinimalGraph = {
        nodes: [cause1, problem, solution, component2, customA, customC],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(cause1, "causes", problem, [
            cause1_causes_cause2,
            cause2_causes_problem,
          ]),
          buildIndirectEdge(solution, "has", component2, [
            solution_has_component1,
            component1_has_component2,
          ]),
          buildIndirectEdge(customA, "relatesTo", customC, [
            customA_relatesTo_customB,
            customB_relatesTo_customC,
          ]),
        ]),
      );
    });

    // because this makes logic easier, and seeing an indirect path kind of seems reasonable just to know that there are other ways A causes B
    test("shows even when there's already a visible edge of the same type", () => {
      const problem = buildNode({ type: "problem", text: "problem" });
      const cause2 = buildNode({ type: "cause", text: "cause 2" });
      const cause1 = buildNode({ type: "cause", text: "cause 1" });

      const cause1_causes_cause2 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause2.id,
      });
      const cause2_causes_problem = buildEdge({
        sourceId: cause2.id,
        relation: "causes",
        targetId: problem.id,
      });
      const cause1_causes_problem = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: problem.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [problem, cause2, cause1],
        edges: [cause1_causes_cause2, cause2_causes_problem, cause1_causes_problem],
      };

      // Hide cause2; cause1 directly causes problem via visible edge
      const displayedDiagram: MinimalGraph = {
        nodes: [problem, cause1],
        edges: [cause1_causes_problem],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(1);
      expect(result).toEqual([
        buildIndirectEdge(cause1, "causes", problem, [cause1_causes_cause2, cause2_causes_problem]),
      ]);
    });

    test("shows only one path, arbitrarily-chosen, for each source-target + edge type combination", () => {
      const problem = buildNode({ type: "problem", text: "problem" });
      const cause2 = buildNode({ type: "cause", text: "cause 2" });
      const cause3 = buildNode({ type: "cause", text: "cause 3" });
      const cause4 = buildNode({ type: "cause", text: "cause 4" });
      const custom = buildNode({ type: "custom", text: "custom" });
      const cause1 = buildNode({ type: "cause", text: "cause 1" });

      // Multiple "causes" paths from cause1 to problem
      const cause1_causes_cause2 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause2.id,
      });
      const cause2_causes_problem = buildEdge({
        sourceId: cause2.id,
        relation: "causes",
        targetId: problem.id,
      });
      const cause1_causes_cause3 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause3.id,
      });
      const cause3_causes_problem = buildEdge({
        sourceId: cause3.id,
        relation: "causes",
        targetId: problem.id,
      });
      const problem_causes_cause4 = buildEdge({
        sourceId: problem.id,
        relation: "causes",
        targetId: cause4.id,
      });
      const cause4_causes_cause1 = buildEdge({
        sourceId: cause4.id,
        relation: "causes",
        targetId: cause1.id,
      });

      // "relatesTo" path from cause1 to problem
      const cause1_relatesTo_custom = buildEdge({
        sourceId: cause1.id,
        relation: "relatesTo",
        targetId: custom.id,
      });
      const custom_relatesTo_problem = buildEdge({
        sourceId: custom.id,
        relation: "relatesTo",
        targetId: problem.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [problem, cause2, cause3, cause4, custom, cause1],
        edges: [
          cause1_causes_cause2,
          cause2_causes_problem,
          cause1_causes_cause3,
          cause3_causes_problem,
          problem_causes_cause4,
          cause4_causes_cause1,
          cause1_relatesTo_custom,
          custom_relatesTo_problem,
        ],
      };

      // Hide cause2, cause3, cause4, custom
      const displayedDiagram: MinimalGraph = {
        nodes: [problem, cause1],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(cause1, "causes", problem, [
            cause1_causes_cause2,
            cause2_causes_problem,
          ]),
          buildIndirectEdge(problem, "causes", cause1, [
            problem_causes_cause4,
            cause4_causes_cause1,
          ]),
          buildIndirectEdge(cause1, "relatesTo", problem, [
            cause1_relatesTo_custom,
            custom_relatesTo_problem,
          ]),
        ]),
      );
    });
  });

  // note: any "reduces"-type edge ("addresses", "impedes") will flip the indirect path's causality
  describe("'reduces' relations", () => {
    test("can indirectly address via hidden addressed cause", () => {
      const solution = buildNode({ type: "solution", text: "solution" });
      const cause = buildNode({ type: "cause", text: "cause" });
      const problem = buildNode({ type: "problem", text: "problem" });

      const solution_addresses_cause = buildEdge({
        sourceId: solution.id,
        relation: "addresses",
        targetId: cause.id,
      });
      const cause_causes_problem = buildEdge({
        sourceId: cause.id,
        relation: "causes",
        targetId: problem.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [solution, cause, problem],
        edges: [solution_addresses_cause, cause_causes_problem],
      };

      // Hide cause
      const displayedDiagram: MinimalGraph = {
        nodes: [solution, problem],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(1);
      expect(result).toEqual([
        buildIndirectEdge(solution, "addresses", problem, [
          solution_addresses_cause,
          cause_causes_problem,
        ]),
      ]);
    });

    test("can indirectly address via hidden caused addresser", () => {
      const solution = buildNode({ type: "solution", text: "solution" });
      const benefit = buildNode({ type: "benefit", text: "benefit" });
      const problem = buildNode({ type: "problem", text: "problem" });

      const solution_causes_benefit = buildEdge({
        sourceId: solution.id,
        relation: "causes",
        targetId: benefit.id,
      });
      const benefit_addresses_problem = buildEdge({
        sourceId: benefit.id,
        relation: "addresses",
        targetId: problem.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [solution, benefit, problem],
        edges: [solution_causes_benefit, benefit_addresses_problem],
      };

      // Hide benefit
      const displayedDiagram: MinimalGraph = {
        nodes: [solution, problem],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(1);
      expect(result).toEqual([
        buildIndirectEdge(solution, "addresses", problem, [
          solution_causes_benefit,
          benefit_addresses_problem,
        ]),
      ]);
    });

    test("can indirectly cause via hidden reduced reducer", () => {
      const solution = buildNode({ type: "solution", text: "solution" });
      const detriment = buildNode({ type: "detriment", text: "detriment" });
      const benefit = buildNode({ type: "benefit", text: "benefit" });

      const solution_reduces_detriment = buildEdge({
        sourceId: solution.id,
        relation: "reduces",
        targetId: detriment.id,
      });
      const detriment_reduces_benefit = buildEdge({
        sourceId: detriment.id,
        relation: "reduces",
        targetId: benefit.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [solution, detriment, benefit],
        edges: [solution_reduces_detriment, detriment_reduces_benefit],
      };

      // Hide detriment
      const displayedDiagram: MinimalGraph = {
        nodes: [solution, benefit],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(1);
      expect(result).toEqual([
        buildIndirectEdge(solution, "causes", benefit, [
          solution_reduces_detriment,
          detriment_reduces_benefit,
        ]),
      ]);
    });

    // if our path is "reduces"-type, we need to look upstream for "causes" edges
    describe("reducing an effect of something", () => {
      test("can indirectly address via hidden addressed effect", () => {
        const problem = buildNode({ type: "problem", text: "problem" });
        const detriment = buildNode({ type: "detriment", text: "detriment" });
        const solution = buildNode({ type: "solution", text: "solution" });

        const problem_causes_detriment = buildEdge({
          sourceId: problem.id,
          relation: "causes",
          targetId: detriment.id,
        });
        const solution_addresses_detriment = buildEdge({
          sourceId: solution.id,
          relation: "addresses",
          targetId: detriment.id,
        });

        const fullDiagram: MinimalGraph = {
          nodes: [problem, detriment, solution],
          edges: [problem_causes_detriment, solution_addresses_detriment],
        };

        // Hide detriment
        const displayedDiagram: MinimalGraph = {
          nodes: [problem, solution],
          edges: [],
        };

        const result = getIndirectEdges(displayedDiagram, fullDiagram);

        expect(result).toHaveLength(1);
        expect(result).toEqual([
          buildIndirectEdge(solution, "addressesEffectOf", problem, [
            solution_addresses_detriment,
            problem_causes_detriment,
          ]),
        ]);
      });

      /**
       * It'd be great if we didn't have to treat addresses & causes differently, but "causes effect of"
       * seems hard to think about, and logic would be a little harder? we'd be finding the same
       * indirect edge from p -> s and s -> p.
       */
      test("but doesn't show when two cause the same effect", () => {
        const problem = buildNode({ type: "problem", text: "problem" });
        const detriment = buildNode({ type: "detriment", text: "detriment" });
        const solution = buildNode({ type: "solution", text: "solution" });

        const problem_causes_detriment = buildEdge({
          sourceId: problem.id,
          relation: "causes",
          targetId: detriment.id,
        });
        const solution_causes_detriment = buildEdge({
          sourceId: solution.id,
          relation: "causes",
          targetId: detriment.id,
        });

        const fullDiagram: MinimalGraph = {
          nodes: [problem, detriment, solution],
          edges: [problem_causes_detriment, solution_causes_detriment],
        };

        // Hide detriment
        const displayedDiagram: MinimalGraph = {
          nodes: [problem, solution],
          edges: [],
        };

        const result = getIndirectEdges(displayedDiagram, fullDiagram);

        expect(result).toHaveLength(0);
      });

      test("can indirectly mitigate via hidden addressed effect", () => {
        const solution = buildNode({ type: "solution", text: "solution" });
        const detriment = buildNode({ type: "detriment", text: "detriment" });
        const mitigation = buildNode({ type: "mitigation", text: "mitigation" });

        const solution_causes_detriment = buildEdge({
          sourceId: solution.id,
          relation: "causes",
          targetId: detriment.id,
        });
        const mitigation_mitigates_detriment = buildEdge({
          sourceId: mitigation.id,
          relation: "mitigates",
          targetId: detriment.id,
        });

        const fullDiagram: MinimalGraph = {
          nodes: [solution, detriment, mitigation],
          edges: [solution_causes_detriment, mitigation_mitigates_detriment],
        };

        // Hide detriment
        const displayedDiagram: MinimalGraph = {
          nodes: [solution, mitigation],
          edges: [],
        };

        const result = getIndirectEdges(displayedDiagram, fullDiagram);

        expect(result).toHaveLength(1);
        expect(result).toEqual([
          buildIndirectEdge(mitigation, "mitigatesEffectOf", solution, [
            mitigation_mitigates_detriment,
            solution_causes_detriment,
          ]),
        ]);
      });

      // because solutions are currently intended to be mutually-exclusive
      test("but doesn't show when both source and target are solutions", () => {
        const solution = buildNode({ type: "solution", text: "solution" });
        const detriment = buildNode({ type: "detriment", text: "detriment" });
        const solution2 = buildNode({ type: "solution", text: "solution 2" });

        const solution_causes_detriment = buildEdge({
          sourceId: solution.id,
          relation: "causes",
          targetId: detriment.id,
        });
        const solution2_mitigates_detriment = buildEdge({
          sourceId: solution2.id,
          relation: "mitigates",
          targetId: detriment.id,
        });

        const fullDiagram: MinimalGraph = {
          nodes: [solution, detriment, solution2],
          edges: [solution_causes_detriment, solution2_mitigates_detriment],
        };

        // Hide detriment
        const displayedDiagram: MinimalGraph = {
          nodes: [solution, solution2],
          edges: [],
        };

        const result = getIndirectEdges(displayedDiagram, fullDiagram);

        expect(result).toHaveLength(0);
      });

      test("can indirectly impede via hidden benefit", () => {
        const solution = buildNode({ type: "solution", text: "solution" });
        const benefit = buildNode({ type: "benefit", text: "benefit" });
        const obstacle = buildNode({ type: "obstacle", text: "obstacle" });

        const solution_causes_benefit = buildEdge({
          sourceId: solution.id,
          relation: "causes",
          targetId: benefit.id,
        });
        const obstacle_impedes_benefit = buildEdge({
          sourceId: obstacle.id,
          relation: "impedes",
          targetId: benefit.id,
        });

        const fullDiagram: MinimalGraph = {
          nodes: [solution, benefit, obstacle],
          edges: [solution_causes_benefit, obstacle_impedes_benefit],
        };

        // Hide benefit
        const displayedDiagram: MinimalGraph = {
          nodes: [solution, obstacle],
          edges: [],
        };

        const result = getIndirectEdges(displayedDiagram, fullDiagram);

        expect(result).toHaveLength(1);
        expect(result).toEqual([
          buildIndirectEdge(obstacle, "impedes", solution, [
            obstacle_impedes_benefit,
            solution_causes_benefit,
          ]),
        ]);
      });
    });
  });

  // for all non-"has" paths, we need to look upstream for "has" edges
  describe("component relations", () => {
    test("can indirectly relate in any way via hidden component", () => {
      const solution = buildNode({ type: "solution", text: "solution" });
      const obstacle = buildNode({ type: "obstacle", text: "obstacle" });
      const custom = buildNode({ type: "custom", text: "custom" });
      const component = buildNode({ type: "solutionComponent", text: "component" });

      const solution_has_component = buildEdge({
        sourceId: solution.id,
        relation: "has",
        targetId: component.id,
      });
      const obstacle_impedes_component = buildEdge({
        sourceId: obstacle.id,
        relation: "impedes",
        targetId: component.id,
      });
      const custom_relatesTo_component = buildEdge({
        sourceId: custom.id,
        relation: "relatesTo",
        targetId: component.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [solution, obstacle, custom, component],
        edges: [solution_has_component, obstacle_impedes_component, custom_relatesTo_component],
      };

      // Hide component
      const displayedDiagram: MinimalGraph = {
        nodes: [solution, obstacle, custom],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(obstacle, "impedes", solution, [
            obstacle_impedes_component,
            solution_has_component,
          ]),
          buildIndirectEdge(custom, "relatesTo", solution, [
            custom_relatesTo_component,
            solution_has_component,
          ]),
        ]),
      );
    });

    test("but doesn't show when two 'has' the same hidden node", () => {
      const solution = buildNode({ type: "solution", text: "solution" });
      const custom = buildNode({ type: "custom", text: "custom" });
      const component = buildNode({ type: "solutionComponent", text: "component" });

      const solution_has_component = buildEdge({
        sourceId: solution.id,
        relation: "has",
        targetId: component.id,
      });
      const custom_has_component = buildEdge({
        sourceId: custom.id,
        relation: "has",
        targetId: component.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [solution, custom, component],
        edges: [solution_has_component, custom_has_component],
      };

      // Hide component
      const displayedDiagram: MinimalGraph = {
        nodes: [solution, custom],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(0);
    });

    test("'has' always gets 'overpowered' by the other edge types in a path", () => {
      // has then causes
      const solution = buildNode({ type: "solution", text: "solution" });
      const component = buildNode({ type: "solutionComponent", text: "component" });
      const benefit = buildNode({ type: "benefit", text: "benefit" });

      const solution_has_component = buildEdge({
        sourceId: solution.id,
        relation: "has",
        targetId: component.id,
      });
      const component_causes_benefit = buildEdge({
        sourceId: component.id,
        relation: "causes",
        targetId: benefit.id,
      });

      // causes then has
      const cause = buildNode({ type: "cause", text: "cause" });
      const problem = buildNode({ type: "problem", text: "problem" });
      const problem2 = buildNode({ type: "problem", text: "problem 2" });

      const cause_causes_problem = buildEdge({
        sourceId: cause.id,
        relation: "causes",
        targetId: problem.id,
      });
      const problem_has_problem2 = buildEdge({
        sourceId: problem.id,
        relation: "has",
        targetId: problem2.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [solution, component, benefit, cause, problem, problem2],
        edges: [
          solution_has_component,
          component_causes_benefit,
          cause_causes_problem,
          problem_has_problem2,
        ],
      };

      // Hide component and problem
      const displayedDiagram: MinimalGraph = {
        nodes: [solution, benefit, cause, problem2],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(solution, "causes", benefit, [
            solution_has_component,
            component_causes_benefit,
          ]),
          buildIndirectEdge(cause, "causes", problem2, [
            cause_causes_problem,
            problem_has_problem2,
          ]),
        ]),
      );
    });
  });

  // "Maybe" is prefixed because claim wording is usually in relation to the parent,
  // and therefore may not make sense in relation to grandparent
  describe("justification relations", () => {
    test("upstream 'supports' increases parent strength, resulting in maybe-same relation on the grandparent", () => {
      // supports a support
      const support1 = buildNode({ type: "support", text: "support 1" });
      const support2 = buildNode({ type: "support", text: "support 2" });
      const rootClaim = buildNode({ type: "rootClaim", text: "root claim" });

      const support1_supports_support2 = buildEdge({
        sourceId: support1.id,
        relation: "supports",
        targetId: support2.id,
      });
      const support2_supports_rootClaim = buildEdge({
        sourceId: support2.id,
        relation: "supports",
        targetId: rootClaim.id,
      });

      // supports a critique
      const support = buildNode({ type: "support", text: "support" });
      const critique = buildNode({ type: "critique", text: "critique" });
      const rootClaim2 = buildNode({ type: "rootClaim", text: "root claim 2" });

      const support_supports_critique = buildEdge({
        sourceId: support.id,
        relation: "supports",
        targetId: critique.id,
      });
      const critique_critiques_rootClaim2 = buildEdge({
        sourceId: critique.id,
        relation: "critiques",
        targetId: rootClaim2.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [support1, support2, rootClaim, support, critique, rootClaim2],
        edges: [
          support1_supports_support2,
          support2_supports_rootClaim,
          support_supports_critique,
          critique_critiques_rootClaim2,
        ],
      };

      // Hide support2 and critique
      const displayedDiagram: MinimalGraph = {
        nodes: [support1, rootClaim, support, rootClaim2],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(support1, "maybeSupports", rootClaim, [
            support1_supports_support2,
            support2_supports_rootClaim,
          ]),
          buildIndirectEdge(support, "maybeCritiques", rootClaim2, [
            support_supports_critique,
            critique_critiques_rootClaim2,
          ]),
        ]),
      );
    });

    test("upstream 'critiques' reduces parent strength, resulting in maybe-opposite relation on the grandparent", () => {
      // critiques a support
      const critique = buildNode({ type: "critique", text: "critique" });
      const support = buildNode({ type: "support", text: "support" });
      const rootClaim = buildNode({ type: "rootClaim", text: "root claim" });

      const critique_critiques_support = buildEdge({
        sourceId: critique.id,
        relation: "critiques",
        targetId: support.id,
      });
      const support_supports_rootClaim = buildEdge({
        sourceId: support.id,
        relation: "supports",
        targetId: rootClaim.id,
      });

      // critiques a critique
      const critique1 = buildNode({ type: "critique", text: "critique 1" });
      const critique2 = buildNode({ type: "critique", text: "critique 2" });
      const rootClaim2 = buildNode({ type: "rootClaim", text: "root claim 2" });

      const critique1_critiques_critique2 = buildEdge({
        sourceId: critique1.id,
        relation: "critiques",
        targetId: critique2.id,
      });
      const critique2_critiques_rootClaim2 = buildEdge({
        sourceId: critique2.id,
        relation: "critiques",
        targetId: rootClaim2.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [critique, support, rootClaim, critique1, critique2, rootClaim2],
        edges: [
          critique_critiques_support,
          support_supports_rootClaim,
          critique1_critiques_critique2,
          critique2_critiques_rootClaim2,
        ],
      };

      // Hide support and critique2
      const displayedDiagram: MinimalGraph = {
        nodes: [critique, rootClaim, critique1, rootClaim2],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(critique, "maybeCritiques", rootClaim, [
            critique_critiques_support,
            support_supports_rootClaim,
          ]),
          buildIndirectEdge(critique1, "maybeSupports", rootClaim2, [
            critique1_critiques_critique2,
            critique2_critiques_rootClaim2,
          ]),
        ]),
      );
    });
  });

  describe("research relations", () => {
    test("doesn't show for research relations", () => {
      const fact = buildNode({ type: "fact", text: "fact" });
      const question = buildNode({ type: "question", text: "question" });
      const problem = buildNode({ type: "problem", text: "problem" });

      const fact_relevantFor_question = buildEdge({
        sourceId: fact.id,
        relation: "relevantFor",
        targetId: question.id,
      });
      const question_asksAbout_problem = buildEdge({
        sourceId: question.id,
        relation: "asksAbout",
        targetId: problem.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [fact, question, problem],
        edges: [fact_relevantFor_question, question_asksAbout_problem],
      };

      // Hide question
      const displayedDiagram: MinimalGraph = {
        nodes: [fact, problem],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(0);
    });
  });

  describe("misc relations", () => {
    test("'relates to' always 'overpowers' the other edge types in a path", () => {
      // causes then relatesTo
      const cause1 = buildNode({ type: "cause", text: "cause 1" });
      const cause2 = buildNode({ type: "cause", text: "cause 2" });
      const custom = buildNode({ type: "custom", text: "custom" });

      const cause1_causes_cause2 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause2.id,
      });
      const cause2_relatesTo_custom = buildEdge({
        sourceId: cause2.id,
        relation: "relatesTo",
        targetId: custom.id,
      });

      // relatesTo then has
      const customA = buildNode({ type: "custom", text: "custom a" });
      const customB = buildNode({ type: "custom", text: "custom b" });
      const customC = buildNode({ type: "custom", text: "custom c" });

      const customA_relatesTo_customB = buildEdge({
        sourceId: customA.id,
        relation: "relatesTo",
        targetId: customB.id,
      });
      const customB_has_customC = buildEdge({
        sourceId: customB.id,
        relation: "has",
        targetId: customC.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [cause1, cause2, custom, customA, customB, customC],
        edges: [
          cause1_causes_cause2,
          cause2_relatesTo_custom,
          customA_relatesTo_customB,
          customB_has_customC,
        ],
      };

      // Hide cause2 and customB
      const displayedDiagram: MinimalGraph = {
        nodes: [cause1, custom, customA, customC],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          buildIndirectEdge(cause1, "relatesTo", custom, [
            cause1_causes_cause2,
            cause2_relatesTo_custom,
          ]),
          buildIndirectEdge(customA, "relatesTo", customC, [
            customA_relatesTo_customB,
            customB_has_customC,
          ]),
        ]),
      );
    });
  });

  describe("complex cases", () => {
    test("can have multiple, longer-path indirect edges at once", () => {
      // cause chain to problem
      const cause1 = buildNode({ type: "cause", text: "cause 1" });
      const cause2 = buildNode({ type: "cause", text: "cause 2" });
      const cause3 = buildNode({ type: "cause", text: "cause 3" });
      const problem = buildNode({ type: "problem", text: "problem" });

      const cause1_causes_cause2 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause2.id,
      });
      const cause1_causes_cause3 = buildEdge({
        sourceId: cause1.id,
        relation: "causes",
        targetId: cause3.id,
      });
      const cause2_causes_problem = buildEdge({
        sourceId: cause2.id,
        relation: "causes",
        targetId: problem.id,
      });
      const cause3_causes_problem = buildEdge({
        sourceId: cause3.id,
        relation: "causes",
        targetId: problem.id,
      });

      // solution/benefit chain addressing detriments
      const solution = buildNode({ type: "solution", text: "solution" });
      const benefit1 = buildNode({ type: "benefit", text: "benefit 1" });
      const benefit2 = buildNode({ type: "benefit", text: "benefit 2" });
      const benefit3 = buildNode({ type: "benefit", text: "benefit 3" });

      const solution_causes_benefit1 = buildEdge({
        sourceId: solution.id,
        relation: "causes",
        targetId: benefit1.id,
      });
      const benefit1_causes_benefit2 = buildEdge({
        sourceId: benefit1.id,
        relation: "causes",
        targetId: benefit2.id,
      });
      const benefit2_causes_benefit3 = buildEdge({
        sourceId: benefit2.id,
        relation: "causes",
        targetId: benefit3.id,
      });

      // problem causes detriments, benefits address them
      const detriment1 = buildNode({ type: "detriment", text: "detriment 1" });
      const detriment2 = buildNode({ type: "detriment", text: "detriment 2" });

      const problem_causes_detriment1 = buildEdge({
        sourceId: problem.id,
        relation: "causes",
        targetId: detriment1.id,
      });
      const detriment1_causes_detriment2 = buildEdge({
        sourceId: detriment1.id,
        relation: "causes",
        targetId: detriment2.id,
      });
      const benefit3_addresses_detriment2 = buildEdge({
        sourceId: benefit3.id,
        relation: "addresses",
        targetId: detriment2.id,
      });

      const fullDiagram: MinimalGraph = {
        nodes: [
          cause1,
          cause2,
          cause3,
          solution,
          benefit1,
          benefit2,
          benefit3,
          problem,
          detriment1,
          detriment2,
        ],
        edges: [
          cause1_causes_cause2,
          cause1_causes_cause3,
          solution_causes_benefit1,
          benefit1_causes_benefit2,
          benefit2_causes_benefit3,
          cause2_causes_problem,
          cause3_causes_problem,
          problem_causes_detriment1,
          detriment1_causes_detriment2,
          benefit3_addresses_detriment2,
        ],
      };

      // Hide cause2, cause3, detriment1, detriment2, benefit1, benefit2, benefit3
      const displayedDiagram: MinimalGraph = {
        nodes: [cause1, solution, problem],
        edges: [],
      };

      const result = getIndirectEdges(displayedDiagram, fullDiagram);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          // The chosen path is arbitrary but deterministic; cause1 can reach problem via cause2 or cause3
          buildIndirectEdge(cause1, "causes", problem, [
            cause1_causes_cause2,
            cause2_causes_problem,
          ]),
          buildIndirectEdge(solution, "addressesEffectOf", problem, [
            solution_causes_benefit1,
            benefit1_causes_benefit2,
            benefit2_causes_benefit3,
            benefit3_addresses_detriment2,
            detriment1_causes_detriment2,
            problem_causes_detriment1,
          ]),
        ]),
      );
    });
  });
});
