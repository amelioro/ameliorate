import { describe, expect, test } from "vitest";

import { getSolutionBenefits } from "@/web/summary/aspectFilter";
import { Graph, buildEdge, buildNode } from "@/web/topic/utils/graph";

describe("getBenefits", () => {
  test("finds nothing when there are no benefits", () => {
    const fromSolution = buildNode({ type: "solution" });
    const childObstacle = buildNode({ type: "obstacle" });
    const parentEffect = buildNode({ type: "effect" });

    const graph: Graph = {
      nodes: [fromSolution, childObstacle, parentEffect],
      edges: [
        buildEdge({
          sourceId: fromSolution.id,
          targetId: childObstacle.id,
          relation: "obstacleOf",
        }),
        buildEdge({ sourceId: parentEffect.id, targetId: fromSolution.id, relation: "creates" }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([]);
    expect(indirectNodes).toEqual([]);
  });

  test("finds direct and indirect benefits", () => {
    const fromSolution = buildNode({ type: "solution" });

    const randomObstacle = buildNode({ type: "obstacle" });

    const parentEffect = buildNode({ type: "effect" });
    const parentComponent = buildNode({ type: "solutionComponent" });

    const parentBenefit = buildNode({ type: "benefit" });
    const ancestorBenefitViaBenefit = buildNode({ type: "benefit" });
    const ancestorBenefitViaComponent = buildNode({ type: "benefit" });

    const graph: Graph = {
      nodes: [
        fromSolution,
        randomObstacle,
        parentEffect,
        parentComponent,
        parentBenefit,
        ancestorBenefitViaBenefit,
        ancestorBenefitViaComponent,
      ],
      edges: [
        buildEdge({
          sourceId: fromSolution.id,
          targetId: randomObstacle.id,
          relation: "obstacleOf",
        }),

        buildEdge({ sourceId: parentEffect.id, targetId: fromSolution.id, relation: "creates" }),
        buildEdge({ sourceId: parentComponent.id, targetId: fromSolution.id, relation: "has" }),

        buildEdge({ sourceId: parentBenefit.id, targetId: fromSolution.id, relation: "creates" }),
        buildEdge({
          sourceId: ancestorBenefitViaBenefit.id,
          targetId: parentBenefit.id,
          relation: "creates",
        }),
        buildEdge({
          sourceId: ancestorBenefitViaComponent.id,
          targetId: parentComponent.id,
          relation: "creates",
        }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([parentBenefit]);
    expect(indirectNodes).toIncludeSameMembers([
      ancestorBenefitViaBenefit,
      ancestorBenefitViaComponent,
    ]);
  });
});
