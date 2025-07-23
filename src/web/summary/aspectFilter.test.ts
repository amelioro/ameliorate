import { describe, expect, test } from "vitest";

import { getAddressed, getSolutionBenefits } from "@/web/summary/aspectFilter";
import { Graph, buildEdge, buildNode } from "@/web/topic/utils/graph";

describe("getSolutionBenefits", () => {
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

    expect(directNodes).toEqual([{ ...parentBenefit, layersAway: 1 }]);
    expect(indirectNodes).toIncludeSameMembers([
      { ...ancestorBenefitViaBenefit, layersAway: 2 },
      { ...ancestorBenefitViaComponent, layersAway: 2 },
    ]);
  });
});

describe("getAddressed", () => {
  test("finds nothing when there's nothing being addressed", () => {
    const fromSolution = buildNode({ type: "solution" });
    const childObstacle = buildNode({ type: "obstacle" });
    const parentProblem = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromSolution, childObstacle, parentProblem],
      edges: [
        buildEdge({
          sourceId: fromSolution.id,
          targetId: childObstacle.id,
          relation: "obstacleOf",
        }),
        buildEdge({ sourceId: parentProblem.id, targetId: fromSolution.id, relation: "relatesTo" }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([]);
    expect(indirectNodes).toEqual([]);
  });

  test("finds direct and indirect addressed nodes", () => {
    const fromSolution = buildNode({ type: "solution" });

    const randomObstacle = buildNode({ type: "obstacle" });

    const parentEffect = buildNode({ type: "effect" });
    const parentComponent = buildNode({ type: "solutionComponent" });

    const addressedProblem = buildNode({ type: "problem" });
    const addressedCauseViaEffect = buildNode({ type: "cause" });
    const addressedDetrimentViaComponent = buildNode({ type: "detriment" });

    const graph: Graph = {
      nodes: [
        fromSolution,
        randomObstacle,
        parentEffect,
        parentComponent,
        addressedProblem,
        addressedCauseViaEffect,
        addressedDetrimentViaComponent,
      ],
      edges: [
        buildEdge({
          sourceId: fromSolution.id,
          targetId: randomObstacle.id,
          relation: "obstacleOf",
        }),

        buildEdge({ sourceId: parentEffect.id, targetId: fromSolution.id, relation: "creates" }),
        buildEdge({ sourceId: parentComponent.id, targetId: fromSolution.id, relation: "has" }),

        buildEdge({
          sourceId: addressedProblem.id,
          targetId: fromSolution.id,
          relation: "addresses",
        }),
        buildEdge({
          sourceId: addressedCauseViaEffect.id,
          targetId: parentEffect.id,
          relation: "addresses",
        }),
        buildEdge({
          sourceId: addressedDetrimentViaComponent.id,
          targetId: parentComponent.id,
          relation: "addresses",
        }),
      ],
    };

    const { directNodes, indirectNodes } = getAddressed(fromSolution, graph);

    expect(directNodes).toEqual([{ ...addressedProblem, layersAway: 1 }]);
    expect(indirectNodes).toIncludeSameMembers([
      { ...addressedCauseViaEffect, layersAway: 2 },
      { ...addressedDetrimentViaComponent, layersAway: 2 },
    ]);
  });
});
