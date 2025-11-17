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
          sourceId: solutionObstacle.id,
          relation: "obstacleOf",
          targetId: fromSolution.id,
        }),
        buildEdge({ sourceId: fromSolution.id, relation: "creates", targetId: solutionEffect.id }),
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
    const downstreamBenefitViaBenefit = buildNode({ type: "benefit" });
    const downstreamBenefitViaComponent = buildNode({ type: "benefit" });

    const graph: Graph = {
      nodes: [
        fromSolution,
        randomObstacle,
        solutionEffect,
        solutionComponent,
        solutionBenefit,
        downstreamBenefitViaBenefit,
        downstreamBenefitViaComponent,
      ],
      edges: [
        buildEdge({
          sourceId: randomObstacle.id,
          relation: "obstacleOf",
          targetId: fromSolution.id,
        }),

        buildEdge({ sourceId: fromSolution.id, relation: "creates", targetId: solutionEffect.id }),
        buildEdge({ sourceId: fromSolution.id, relation: "has", targetId: solutionComponent.id }),

        buildEdge({ sourceId: fromSolution.id, relation: "creates", targetId: solutionBenefit.id }),
        buildEdge({
          sourceId: solutionBenefit.id,
          relation: "creates",
          targetId: downstreamBenefitViaBenefit.id,
        }),
        buildEdge({
          sourceId: solutionComponent.id,
          relation: "creates",
          targetId: downstreamBenefitViaComponent.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getSolutionBenefits(fromSolution, graph);

    expect(directNodes).toEqual([{ ...solutionBenefit, layersAway: 1 }]);
    expect(indirectNodes).toIncludeSameMembers([
      { ...downstreamBenefitViaBenefit, layersAway: 2 },
      { ...downstreamBenefitViaComponent, layersAway: 2 },
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
          sourceId: solutionObstacle.id,
          relation: "obstacleOf",
          targetId: fromSolution.id,
        }),
        buildEdge({
          sourceId: fromSolution.id,
          relation: "relatesTo",
          targetId: solutionProblem.id,
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
          sourceId: randomObstacle.id,
          relation: "obstacleOf",
          targetId: fromSolution.id,
        }),

        buildEdge({ sourceId: fromSolution.id, relation: "creates", targetId: solutionEffect.id }),
        buildEdge({ sourceId: fromSolution.id, relation: "has", targetId: solutionComponent.id }),

        buildEdge({
          sourceId: fromSolution.id,
          relation: "addresses",
          targetId: addressedProblem.id,
        }),
        buildEdge({
          sourceId: solutionEffect.id,
          relation: "addresses",
          targetId: addressedCauseViaEffect.id,
        }),
        buildEdge({
          sourceId: solutionComponent.id,
          relation: "addresses",
          targetId: addressedDetrimentViaComponent.id,
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
