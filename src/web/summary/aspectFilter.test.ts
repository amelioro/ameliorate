import { describe, expect, test } from "vitest";

import { getAddressed, getSolutionBenefits } from "@/web/summary/aspectFilter";
import { Graph, buildEdge, buildNode } from "@/web/topic/utils/graph";

describe("getSolutionBenefits", () => {
  test("finds nothing when there are no benefits", () => {
    const fromSolution = buildNode({ type: "solution" });
    const solutionObstacle = buildNode({ type: "obstacle" });
    const solutionEffect = buildNode({ type: "effect" });

    const graph: Graph = {
      nodes: [fromSolution, solutionObstacle, solutionEffect],
      edges: [
        buildEdge({
          targetId: solutionObstacle.id,
          relation: "obstacleOf",
          sourceId: fromSolution.id,
        }),
        buildEdge({ targetId: fromSolution.id, relation: "creates", sourceId: solutionEffect.id }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([]);
    expect(indirectNodes).toEqual([]);
  });

  test("finds direct and indirect benefits", () => {
    const fromSolution = buildNode({ type: "solution" });

    const randomObstacle = buildNode({ type: "obstacle" });

    const solutionEffect = buildNode({ type: "effect" });
    const solutionComponent = buildNode({ type: "solutionComponent" });

    const solutionBenefit = buildNode({ type: "benefit" });
    const upstreamBenefitViaBenefit = buildNode({ type: "benefit" });
    const upstreamBenefitViaComponent = buildNode({ type: "benefit" });

    const graph: Graph = {
      nodes: [
        fromSolution,
        randomObstacle,
        solutionEffect,
        solutionComponent,
        solutionBenefit,
        upstreamBenefitViaBenefit,
        upstreamBenefitViaComponent,
      ],
      edges: [
        buildEdge({
          sourceId: fromSolution.id,
          targetId: randomObstacle.id,
          relation: "obstacleOf",
        }),

        buildEdge({ targetId: fromSolution.id, relation: "creates", sourceId: solutionEffect.id }),
        buildEdge({ targetId: fromSolution.id, relation: "has", sourceId: solutionComponent.id }),

        buildEdge({ targetId: fromSolution.id, relation: "creates", sourceId: solutionBenefit.id }),
        buildEdge({
          targetId: solutionBenefit.id,
          relation: "creates",
          sourceId: upstreamBenefitViaBenefit.id,
        }),
        buildEdge({
          targetId: solutionComponent.id,
          relation: "creates",
          sourceId: upstreamBenefitViaComponent.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([{ ...solutionBenefit, layersAway: 1 }]);
    expect(indirectNodes).toIncludeSameMembers([
      { ...upstreamBenefitViaBenefit, layersAway: 2 },
      { ...upstreamBenefitViaComponent, layersAway: 2 },
    ]);
  });
});

describe("getAddressed", () => {
  test("finds nothing when there's nothing being addressed", () => {
    const fromSolution = buildNode({ type: "solution" });
    const solutionObstacle = buildNode({ type: "obstacle" });
    const solutionProblem = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromSolution, solutionObstacle, solutionProblem],
      edges: [
        buildEdge({
          targetId: solutionObstacle.id,
          relation: "obstacleOf",
          sourceId: fromSolution.id,
        }),
        buildEdge({
          targetId: fromSolution.id,
          relation: "relatesTo",
          sourceId: solutionProblem.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([]);
    expect(indirectNodes).toEqual([]);
  });

  test("finds direct and indirect addressed nodes", () => {
    const fromSolution = buildNode({ type: "solution" });

    const randomObstacle = buildNode({ type: "obstacle" });

    const solutionEffect = buildNode({ type: "effect" });
    const solutionComponent = buildNode({ type: "solutionComponent" });

    const addressedProblem = buildNode({ type: "problem" });
    const addressedCauseViaEffect = buildNode({ type: "cause" });
    const addressedDetrimentViaComponent = buildNode({ type: "detriment" });

    const graph: Graph = {
      nodes: [
        fromSolution,
        randomObstacle,
        solutionEffect,
        solutionComponent,
        addressedProblem,
        addressedCauseViaEffect,
        addressedDetrimentViaComponent,
      ],
      edges: [
        buildEdge({
          targetId: randomObstacle.id,
          relation: "obstacleOf",
          sourceId: fromSolution.id,
        }),

        buildEdge({ targetId: fromSolution.id, relation: "creates", sourceId: solutionEffect.id }),
        buildEdge({ targetId: fromSolution.id, relation: "has", sourceId: solutionComponent.id }),

        buildEdge({
          targetId: fromSolution.id,
          relation: "addresses",
          sourceId: addressedProblem.id,
        }),
        buildEdge({
          targetId: solutionEffect.id,
          relation: "addresses",
          sourceId: addressedCauseViaEffect.id,
        }),
        buildEdge({
          targetId: solutionComponent.id,
          relation: "addresses",
          sourceId: addressedDetrimentViaComponent.id,
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
