import { describe, expect, test } from "vitest";

import { Graph, ancestors, buildEdge, buildNode, descendants } from "@/web/topic/utils/graph";

describe("ancestors", () => {
  test("finds nothing when there are no ancestors", () => {
    const fromNode = buildNode({ type: "problem" });
    const randomNode1 = buildNode({ type: "cause" });
    const randomNode2 = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, randomNode1, randomNode2],
      edges: [
        buildEdge({ sourceId: randomNode2.id, targetId: randomNode1.id, relation: "causes" }),
      ],
    };

    const found = ancestors(fromNode, graph);

    expect(found).toEqual([]);
  });

  test("finds direct and indirect ancestors", () => {
    const fromNode = buildNode({ type: "cause" });
    const directAncestor = buildNode({ type: "cause" });
    const indirectAncestor = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, directAncestor, indirectAncestor],
      edges: [
        buildEdge({ sourceId: directAncestor.id, targetId: fromNode.id, relation: "causes" }),
        buildEdge({
          sourceId: indirectAncestor.id,
          targetId: directAncestor.id,
          relation: "causes",
        }),
      ],
    };

    const found = ancestors(fromNode, graph);

    expect(found).toIncludeSameMembers([indirectAncestor, directAncestor]);
  });

  test("finds ancestors even if there is a cycle", () => {
    const fromNode = buildNode({ type: "cause" });
    const directAncestor = buildNode({ type: "cause" });
    const indirectAncestor = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, directAncestor, indirectAncestor],
      edges: [
        buildEdge({ sourceId: directAncestor.id, targetId: fromNode.id, relation: "causes" }),
        buildEdge({
          sourceId: indirectAncestor.id,
          targetId: directAncestor.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: fromNode.id,
          targetId: indirectAncestor.id,
          relation: "causes",
        }),
      ],
    };

    const found = ancestors(fromNode, graph);

    expect(found).toIncludeSameMembers([indirectAncestor, directAncestor]);
  });

  test("finds only ancestors through edges with labels if labels are passed", () => {
    const fromNode = buildNode({ type: "cause" });
    const label1DirectAncestor = buildNode({ type: "cause" });
    const label2IndirectAncestor = buildNode({ type: "problem" });
    const notLabelDirectAncestor = buildNode({ type: "cause" });
    const label1IndirectAncestorThroughNotLabel = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [
        fromNode,
        label1DirectAncestor,
        label2IndirectAncestor,
        notLabelDirectAncestor,
        label1IndirectAncestorThroughNotLabel,
      ],
      edges: [
        buildEdge({ sourceId: label1DirectAncestor.id, targetId: fromNode.id, relation: "causes" }),
        buildEdge({
          sourceId: label2IndirectAncestor.id,
          targetId: label1DirectAncestor.id,
          relation: "creates", // would usually use `causes` here but this is just to test two labels being passed
        }),
        buildEdge({
          sourceId: notLabelDirectAncestor.id,
          targetId: fromNode.id,
          relation: "relatesTo",
        }),
        buildEdge({
          sourceId: label1IndirectAncestorThroughNotLabel.id,
          targetId: notLabelDirectAncestor.id,
          relation: "causes",
        }),
      ],
    };

    const found = ancestors(fromNode, graph, ["causes", "creates"]);

    expect(found).toIncludeSameMembers([label1DirectAncestor, label2IndirectAncestor]);
  });
});

describe("descendants", () => {
  test("finds nothing when there are no descendants", () => {
    const fromNode = buildNode({ type: "problem" });
    const randomNode1 = buildNode({ type: "cause" });
    const randomNode2 = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, randomNode1, randomNode2],
      edges: [
        buildEdge({ sourceId: randomNode2.id, targetId: randomNode1.id, relation: "causes" }),
      ],
    };

    const found = descendants(fromNode, graph);

    expect(found).toEqual([]);
  });

  test("finds direct and indirect descendants", () => {
    const fromNode = buildNode({ type: "problem" });
    const directDescendant = buildNode({ type: "cause" });
    const indirectDescendant = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [fromNode, directDescendant, indirectDescendant],
      edges: [
        buildEdge({ sourceId: fromNode.id, targetId: directDescendant.id, relation: "causes" }),
        buildEdge({
          sourceId: directDescendant.id,
          targetId: indirectDescendant.id,
          relation: "causes",
        }),
      ],
    };

    const found = descendants(fromNode, graph);

    expect(found).toIncludeSameMembers([directDescendant, indirectDescendant]);
  });

  test("finds descendants even if there is a cycle", () => {
    const fromNode = buildNode({ type: "problem" });
    const directDescendant = buildNode({ type: "cause" });
    const indirectDescendant = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [fromNode, directDescendant, indirectDescendant],
      edges: [
        buildEdge({ sourceId: fromNode.id, targetId: directDescendant.id, relation: "causes" }),
        buildEdge({
          sourceId: directDescendant.id,
          targetId: indirectDescendant.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: indirectDescendant.id,
          targetId: fromNode.id,
          relation: "causes",
        }),
      ],
    };

    const found = descendants(fromNode, graph);

    expect(found).toIncludeSameMembers([indirectDescendant, directDescendant]);
  });

  test("finds only descendants through edges with labels if labels are passed", () => {
    const fromNode = buildNode({ type: "problem" });
    const label1DirectDescendant = buildNode({ type: "cause" });
    const label2IndirectDescendant = buildNode({ type: "cause" });
    const notLabelDirectDescendant = buildNode({ type: "cause" });
    const label1IndirectDescendantThroughNotLabel = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [
        fromNode,
        label1DirectDescendant,
        label2IndirectDescendant,
        notLabelDirectDescendant,
        label1IndirectDescendantThroughNotLabel,
      ],
      edges: [
        buildEdge({
          sourceId: fromNode.id,
          targetId: label1DirectDescendant.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: label1DirectDescendant.id,
          targetId: label2IndirectDescendant.id,
          relation: "creates", // would usually use `causes` here but this is just to test two labels being passed
        }),
        buildEdge({
          sourceId: fromNode.id,
          targetId: notLabelDirectDescendant.id,
          relation: "relatesTo",
        }),
        buildEdge({
          sourceId: notLabelDirectDescendant.id,
          targetId: label1IndirectDescendantThroughNotLabel.id,
          relation: "causes",
        }),
      ],
    };

    const found = descendants(fromNode, graph, ["causes", "creates"]);

    expect(found).toIncludeSameMembers([label1DirectDescendant, label2IndirectDescendant]);
  });
});
