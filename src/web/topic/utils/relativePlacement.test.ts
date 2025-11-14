import { describe, expect, test } from "vitest";

import { Graph, buildEdge, buildNode } from "@/web/topic/utils/graph";
import {
  addableRelationsAbove,
  addableRelationsBelow,
  neighborsAbove,
  neighborsBelow,
} from "@/web/topic/utils/relativePlacement";

describe("neighborsAbove", () => {
  test("returns nodes above", () => {
    const centerSubproblem = buildNode({ type: "problem" });
    const problemAbove = buildNode({ type: "problem" });
    const causeBelow = buildNode({ type: "cause" });
    const detrimentBelow = buildNode({ type: "detriment" });

    const graph: Graph = {
      nodes: [centerSubproblem, problemAbove, causeBelow, detrimentBelow],
      edges: [
        buildEdge({
          targetId: centerSubproblem.id,
          relation: "subproblemOf",
          sourceId: problemAbove.id,
        }),
        buildEdge({ targetId: causeBelow.id, relation: "causes", sourceId: centerSubproblem.id }),
        buildEdge({
          targetId: detrimentBelow.id,
          relation: "createdBy",
          sourceId: centerSubproblem.id,
        }),
      ],
    };

    const result = neighborsAbove(centerSubproblem, graph);

    expect(result).toIncludeSameMembers([problemAbove]);
  });
});

describe("neighborsBelow", () => {
  test("returns nodes below", () => {
    const centerSubproblem = buildNode({ type: "problem" });
    const problemAbove = buildNode({ type: "problem" });
    const causeBelow = buildNode({ type: "cause" });
    const detrimentBelow = buildNode({ type: "detriment" });

    const graph: Graph = {
      nodes: [centerSubproblem, problemAbove, causeBelow, detrimentBelow],
      edges: [
        buildEdge({
          targetId: centerSubproblem.id,
          relation: "subproblemOf",
          sourceId: problemAbove.id,
        }),
        buildEdge({ targetId: causeBelow.id, relation: "causes", sourceId: centerSubproblem.id }),
        buildEdge({
          targetId: detrimentBelow.id,
          relation: "createdBy",
          sourceId: centerSubproblem.id,
        }),
      ],
    };

    const result = neighborsBelow(centerSubproblem, graph);

    expect(result).toIncludeSameMembers([causeBelow, detrimentBelow]);
  });
});

describe("addableRelationsAbove", () => {
  test("solution has expected addables above", () => {
    const addables = addableRelationsAbove("solution", false, "n/a");

    const commonAddableAboveTypes = addables
      .filter((addable) => addable.commonality === "common")
      .map((addable) => addable.parent);
    const uncommonAddableAboveTypes = addables
      .filter((addable) => addable.commonality === "uncommon")
      .map((addable) => addable.parent);

    expect(commonAddableAboveTypes).toIncludeSameMembers([
      "solutionComponent",
      "benefit",
      "detriment",
    ]);
    expect(uncommonAddableAboveTypes).toIncludeSameMembers(["problem", "effect"]);
  });

  test("solution detriment has expected addables above", () => {
    const addables = addableRelationsAbove("detriment", false, "solution");

    const commonAddableAboveTypes = addables
      .filter((addable) => addable.commonality === "common")
      .map((addable) => addable.parent);
    const uncommonAddableAboveTypes = addables
      .filter((addable) => addable.commonality === "uncommon")
      .map((addable) => addable.parent);

    expect(commonAddableAboveTypes).toIncludeSameMembers(["benefit", "detriment"]);
    expect(uncommonAddableAboveTypes).toIncludeSameMembers(["effect"]);
  });

  test("problem detriment has expected addables above", () => {
    const addables = addableRelationsAbove("detriment", false, "problem");

    const commonAddableAboveTypes = addables
      .filter((addable) => addable.commonality === "common")
      .map((addable) => addable.parent);
    const uncommonAddableAboveTypes = addables
      .filter((addable) => addable.commonality === "uncommon")
      .map((addable) => addable.parent);

    expect(commonAddableAboveTypes).toIncludeSameMembers([]);
    expect(uncommonAddableAboveTypes).toIncludeSameMembers([]);
  });
});

describe("addableRelationsBelow", () => {
  test("solution has expected addables below", () => {
    const addables = addableRelationsBelow("solution", false, "n/a");

    const commonAddableBelowTypes = addables
      .filter((addable) => addable.commonality === "common")
      .map((addable) => addable.child);
    const uncommonAddableBelowTypes = addables
      .filter((addable) => addable.commonality === "uncommon")
      .map((addable) => addable.child);

    expect(commonAddableBelowTypes).toIncludeSameMembers([]);
    expect(uncommonAddableBelowTypes).toIncludeSameMembers(["solution", "obstacle"]);
  });

  test("solution detriment has expected addables below", () => {
    const addables = addableRelationsBelow("detriment", false, "solution");

    const commonAddableBelowTypes = addables
      .filter((addable) => addable.commonality === "common")
      .map((addable) => addable.child);
    const uncommonAddableBelowTypes = addables
      .filter((addable) => addable.commonality === "uncommon")
      .map((addable) => addable.child);

    expect(commonAddableBelowTypes).toIncludeSameMembers([]);
    expect(uncommonAddableBelowTypes).toIncludeSameMembers(["mitigation"]);
  });

  test("problem detriment has expected addables below", () => {
    const addables = addableRelationsBelow("detriment", false, "problem");

    const commonAddableBelowTypes = addables
      .filter((addable) => addable.commonality === "common")
      .map((addable) => addable.child);
    const uncommonAddableBelowTypes = addables
      .filter((addable) => addable.commonality === "uncommon")
      .map((addable) => addable.child);

    expect(commonAddableBelowTypes).toIncludeSameMembers(["benefit", "detriment", "solution"]);
    expect(uncommonAddableBelowTypes).toIncludeSameMembers(["effect"]);
  });
});
