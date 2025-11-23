import { describe, expect, test } from "vitest";

import {
  getAddressed,
  getIsAbout,
  getJustification,
  getResearch,
  getSolutionBenefits,
} from "@/web/summary/aspectFilter";
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
          relation: "impedes",
          targetId: fromSolution.id,
        }),
        buildEdge({ sourceId: fromSolution.id, relation: "causes", targetId: solutionEffect.id }),
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
          relation: "impedes",
          targetId: fromSolution.id,
        }),

        buildEdge({ sourceId: fromSolution.id, relation: "causes", targetId: solutionEffect.id }),
        buildEdge({ sourceId: fromSolution.id, relation: "has", targetId: solutionComponent.id }),

        buildEdge({ sourceId: fromSolution.id, relation: "causes", targetId: solutionBenefit.id }),
        buildEdge({
          sourceId: solutionBenefit.id,
          relation: "causes",
          targetId: downstreamBenefitViaBenefit.id,
        }),
        buildEdge({
          sourceId: solutionComponent.id,
          relation: "causes",
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
          relation: "impedes",
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
          relation: "impedes",
          targetId: fromSolution.id,
        }),

        buildEdge({ sourceId: fromSolution.id, relation: "causes", targetId: solutionEffect.id }),
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

describe("getJustification", () => {
  test("finds direct root claim and indirect support/critique for a Solution", () => {
    const solution = buildNode({ type: "solution" });
    const rootClaim = buildNode({
      type: "rootClaim",
      arguedDiagramPartId: solution.id,
    });
    const support = buildNode({ type: "support" });
    const critique = buildNode({ type: "critique" });

    const unrelatedRootClaim = buildNode({ type: "rootClaim" });
    const unrelatedCritique = buildNode({ type: "critique" });

    const graph: Graph = {
      nodes: [solution, rootClaim, support, critique, unrelatedRootClaim, unrelatedCritique],
      edges: [
        buildEdge({
          sourceId: support.id,
          relation: "supports",
          targetId: rootClaim.id,
        }),
        buildEdge({
          sourceId: critique.id,
          relation: "critiques",
          targetId: support.id,
        }),
        buildEdge({
          sourceId: unrelatedCritique.id,
          relation: "critiques",
          targetId: unrelatedRootClaim.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getJustification(solution, graph);

    expect(directNodes).toEqual([rootClaim]);
    expect(indirectNodes).toIncludeSameMembers([
      { ...support, layersAway: 1 },
      { ...critique, layersAway: 2 },
    ]);
  });

  test("finds direct support and indirect critique for a Root Claim", () => {
    const rootClaim = buildNode({ type: "rootClaim" });
    const support = buildNode({ type: "support" });
    const critique = buildNode({ type: "critique" });

    const unrelatedRootClaim = buildNode({ type: "rootClaim" });
    const unrelatedCritique = buildNode({ type: "critique" });

    const graph: Graph = {
      nodes: [rootClaim, support, critique, unrelatedRootClaim, unrelatedCritique],
      edges: [
        buildEdge({
          sourceId: support.id,
          relation: "supports",
          targetId: rootClaim.id,
        }),
        buildEdge({
          sourceId: critique.id,
          relation: "critiques",
          targetId: support.id,
        }),
        buildEdge({
          sourceId: unrelatedCritique.id,
          relation: "critiques",
          targetId: unrelatedRootClaim.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getJustification(rootClaim, graph);

    expect(directNodes).toEqual([{ ...support, layersAway: 1 }]);
    expect(indirectNodes).toEqual([{ ...critique, layersAway: 2 }]);
  });
});

describe("getResearch", () => {
  test("finds direct and indirect research nodes", () => {
    const solution = buildNode({ type: "solution" });
    const question = buildNode({ type: "question" });
    const fact = buildNode({ type: "fact" });
    const source = buildNode({ type: "source" });
    const factForQuestion = buildNode({ type: "fact" });

    const unrelatedSource = buildNode({ type: "source" });
    const unrelatedFact = buildNode({ type: "fact" });

    const graph: Graph = {
      nodes: [solution, question, fact, source, factForQuestion, unrelatedSource, unrelatedFact],
      edges: [
        buildEdge({
          sourceId: question.id,
          relation: "asksAbout",
          targetId: solution.id,
        }),
        buildEdge({
          sourceId: fact.id,
          relation: "relevantFor",
          targetId: solution.id,
        }),
        buildEdge({
          sourceId: source.id,
          relation: "relevantFor",
          targetId: solution.id,
        }),
        buildEdge({
          sourceId: factForQuestion.id,
          relation: "relevantFor",
          targetId: question.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getResearch(solution, graph);

    expect(directNodes).toIncludeSameMembers([
      { ...question, layersAway: 1 },
      { ...fact, layersAway: 1 },
      { ...source, layersAway: 1 },
    ]);
    expect(indirectNodes).toEqual([{ ...factForQuestion, layersAway: 2 }]);
  });
});

describe("getIsAbout", () => {
  test("finds argued diagram part for a Root Claim", () => {
    const solution = buildNode({ type: "solution" });
    const rootClaim = buildNode({
      type: "rootClaim",
      arguedDiagramPartId: solution.id,
    });

    const graph: Graph = {
      nodes: [solution, rootClaim],
      edges: [],
    };

    const { directNodes, indirectNodes } = getIsAbout(rootClaim, graph);

    expect(directNodes).toEqual([solution]);
    expect(indirectNodes).toEqual([]);
  });

  test("finds what a Question asks about", () => {
    const solution = buildNode({ type: "solution" });
    const question = buildNode({ type: "question" });

    const graph: Graph = {
      nodes: [solution, question],
      edges: [
        buildEdge({
          sourceId: question.id,
          relation: "asksAbout",
          targetId: solution.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getIsAbout(question, graph);

    expect(directNodes).toEqual([{ ...solution, layersAway: 1 }]);
    expect(indirectNodes).toEqual([]);
  });

  test("finds what a Critique critiques", () => {
    const rootClaim = buildNode({ type: "rootClaim" });
    const critique = buildNode({ type: "critique" });

    const graph: Graph = {
      nodes: [rootClaim, critique],
      edges: [
        buildEdge({
          sourceId: critique.id,
          relation: "critiques",
          targetId: rootClaim.id,
        }),
      ],
    };

    const { directNodes, indirectNodes } = getIsAbout(critique, graph);

    expect(directNodes).toEqual([{ ...rootClaim, layersAway: 1 }]);
    expect(indirectNodes).toEqual([]);
  });
});
