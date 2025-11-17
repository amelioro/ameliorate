import { describe, expect, test } from "vitest";

import {
  Graph,
  buildEdge,
  buildNode,
  downstreamNodes,
  upstreamNodes,
} from "@/web/topic/utils/graph";

describe("upstreamNodes", () => {
  test("finds nothing when there are no upstream nodes", () => {
    const fromNode = buildNode({ type: "problem" });
    const randomNode1 = buildNode({ type: "cause" });
    const randomNode2 = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, randomNode1, randomNode2],
      edges: [buildEdge({ sourceId: fromNode.id, targetId: randomNode2.id, relation: "causes" })],
    };

    const found = upstreamNodes(fromNode, graph);

    expect(found).toEqual([]);
  });

  test("finds direct and indirect upstream nodes", () => {
    const fromNode = buildNode({ type: "problem" });
    const directUpstreamNode = buildNode({ type: "cause" });
    const indirectUpstreamNode = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [fromNode, directUpstreamNode, indirectUpstreamNode],
      edges: [
        buildEdge({ sourceId: directUpstreamNode.id, targetId: fromNode.id, relation: "causes" }),
        buildEdge({
          sourceId: indirectUpstreamNode.id,
          targetId: directUpstreamNode.id,
          relation: "causes",
        }),
      ],
    };

    const found = upstreamNodes(fromNode, graph);

    expect(found).toIncludeSameMembers([
      { ...indirectUpstreamNode, layersAway: 2 },
      { ...directUpstreamNode, layersAway: 1 },
    ]);
  });

  test("finds upstream nodes even if there is a cycle", () => {
    const fromNode = buildNode({ type: "problem" });
    const directUpstreamNode = buildNode({ type: "cause" });
    const indirectUpstreamNode = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [fromNode, directUpstreamNode, indirectUpstreamNode],
      edges: [
        buildEdge({ sourceId: directUpstreamNode.id, targetId: fromNode.id, relation: "causes" }),
        buildEdge({
          sourceId: indirectUpstreamNode.id,
          targetId: directUpstreamNode.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: fromNode.id,
          targetId: indirectUpstreamNode.id,
          relation: "causes",
        }),
      ],
    };

    const found = upstreamNodes(fromNode, graph);

    expect(found).toIncludeSameMembers([
      { ...indirectUpstreamNode, layersAway: 2 },
      { ...directUpstreamNode, layersAway: 1 },
    ]);
  });

  test("finds only upstream nodes through edges with labels if labels are passed", () => {
    const fromNode = buildNode({ type: "problem" });
    const label1DirectUpstreamNode = buildNode({ type: "cause" });
    const label2IndirectUpstreamNode = buildNode({ type: "cause" });
    const notLabelDirectUpstreamNode = buildNode({ type: "cause" });
    const label1IndirectUpstreamNodeThroughNotLabel = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [
        fromNode,
        label1DirectUpstreamNode,
        label2IndirectUpstreamNode,
        notLabelDirectUpstreamNode,
        label1IndirectUpstreamNodeThroughNotLabel,
      ],
      edges: [
        buildEdge({
          sourceId: label1DirectUpstreamNode.id,
          targetId: fromNode.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: label2IndirectUpstreamNode.id,
          targetId: label1DirectUpstreamNode.id,
          relation: "creates", // would usually use `causes` here but this is just to test two labels being passed
        }),
        buildEdge({
          sourceId: notLabelDirectUpstreamNode.id,
          targetId: fromNode.id,
          relation: "relatesTo",
        }),
        buildEdge({
          sourceId: label1IndirectUpstreamNodeThroughNotLabel.id,
          targetId: notLabelDirectUpstreamNode.id,
          relation: "causes",
        }),
      ],
    };

    const found = upstreamNodes(fromNode, graph, ["causes", "creates"]);

    expect(found).toIncludeSameMembers([
      { ...label1DirectUpstreamNode, layersAway: 1 },
      { ...label2IndirectUpstreamNode, layersAway: 2 },
    ]);
  });
});

describe("downstreamNodes", () => {
  test("finds nothing when there are no downstream nodes", () => {
    const fromNode = buildNode({ type: "cause" });
    const randomNode1 = buildNode({ type: "cause" });
    const randomNode2 = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, randomNode1, randomNode2],
      edges: [buildEdge({ sourceId: randomNode1.id, targetId: fromNode.id, relation: "causes" })],
    };

    const found = downstreamNodes(fromNode, graph);

    expect(found).toEqual([]);
  });

  test("finds direct and indirect downstream nodes", () => {
    const fromNode = buildNode({ type: "cause" });
    const directDownstreamNode = buildNode({ type: "cause" });
    const indirectDownstreamNode = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, directDownstreamNode, indirectDownstreamNode],
      edges: [
        buildEdge({ sourceId: fromNode.id, targetId: directDownstreamNode.id, relation: "causes" }),
        buildEdge({
          sourceId: directDownstreamNode.id,
          targetId: indirectDownstreamNode.id,
          relation: "causes",
        }),
      ],
    };

    const found = downstreamNodes(fromNode, graph);

    expect(found).toIncludeSameMembers([
      { ...directDownstreamNode, layersAway: 1 },
      { ...indirectDownstreamNode, layersAway: 2 },
    ]);
  });

  test("finds downstream nodes even if there is a cycle", () => {
    const fromNode = buildNode({ type: "cause" });
    const directDownstreamNode = buildNode({ type: "cause" });
    const indirectDownstreamNode = buildNode({ type: "problem" });

    const graph: Graph = {
      nodes: [fromNode, directDownstreamNode, indirectDownstreamNode],
      edges: [
        buildEdge({ sourceId: fromNode.id, targetId: directDownstreamNode.id, relation: "causes" }),
        buildEdge({
          sourceId: directDownstreamNode.id,
          targetId: indirectDownstreamNode.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: indirectDownstreamNode.id,
          targetId: fromNode.id,
          relation: "causes",
        }),
      ],
    };

    const found = downstreamNodes(fromNode, graph);

    expect(found).toIncludeSameMembers([
      { ...indirectDownstreamNode, layersAway: 2 },
      { ...directDownstreamNode, layersAway: 1 },
    ]);
  });

  test("finds only downstream nodes through edges with labels if labels are passed", () => {
    const fromNode = buildNode({ type: "cause" });
    const label1DirectDownstreamNode = buildNode({ type: "cause" });
    const label2IndirectDownstreamNode = buildNode({ type: "cause" });
    const notLabelDirectDownstreamNode = buildNode({ type: "cause" });
    const label1IndirectDownstreamNodeThroughNotLabel = buildNode({ type: "cause" });

    const graph: Graph = {
      nodes: [
        fromNode,
        label1DirectDownstreamNode,
        label2IndirectDownstreamNode,
        notLabelDirectDownstreamNode,
        label1IndirectDownstreamNodeThroughNotLabel,
      ],
      edges: [
        buildEdge({
          sourceId: fromNode.id,
          targetId: label1DirectDownstreamNode.id,
          relation: "causes",
        }),
        buildEdge({
          sourceId: label1DirectDownstreamNode.id,
          targetId: label2IndirectDownstreamNode.id,
          relation: "creates", // would usually use `causes` here but this is just to test two labels being passed
        }),
        buildEdge({
          sourceId: fromNode.id,
          targetId: notLabelDirectDownstreamNode.id,
          relation: "relatesTo",
        }),
        buildEdge({
          sourceId: notLabelDirectDownstreamNode.id,
          targetId: label1IndirectDownstreamNodeThroughNotLabel.id,
          relation: "causes",
        }),
      ],
    };

    const found = downstreamNodes(fromNode, graph, ["causes", "creates"]);

    expect(found).toIncludeSameMembers([
      { ...label1DirectDownstreamNode, layersAway: 1 },
      { ...label2IndirectDownstreamNode, layersAway: 2 },
    ]);
  });
});
