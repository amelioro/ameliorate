import { describe, expect, test } from "vitest";

import { Graph, buildEdge, buildNode } from "@/web/topic/utils/graph";
import { neighborsAbove, neighborsBelow } from "@/web/topic/utils/relativePlacement";

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
          sourceId: problemAbove.id,
          relation: "has",
          targetId: centerSubproblem.id,
        }),
        buildEdge({ sourceId: causeBelow.id, relation: "causes", targetId: centerSubproblem.id }),
        buildEdge({
          sourceId: centerSubproblem.id,
          relation: "causes",
          targetId: detrimentBelow.id,
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
          sourceId: problemAbove.id,
          relation: "has",
          targetId: centerSubproblem.id,
        }),
        buildEdge({ sourceId: causeBelow.id, relation: "causes", targetId: centerSubproblem.id }),
        buildEdge({
          sourceId: centerSubproblem.id,
          relation: "causes",
          targetId: detrimentBelow.id,
        }),
      ],
    };

    const result = neighborsBelow(centerSubproblem, graph);

    expect(result).toIncludeSameMembers([causeBelow, detrimentBelow]);
  });
});
