/**
 * The directed search relations in this file are kept here, near the aspect filter
 * functions, because they should match the relations used via `upstreamNodes` and
 * `downstreamNodes` in these filter functions.
 */

import { uniqBy } from "es-toolkit";

import { getEdgeInfoCategory } from "@/common/edge";
import { badNodeTypes, getNodeInfoCategory } from "@/common/node";
import { DirectedSearchRelation, getDirectedRelationDescription } from "@/web/topic/utils/edge";
import {
  Graph,
  Node,
  downstreamNodes,
  findNodeOrThrow,
  splitNodesByDirectAndIndirect,
  upstreamNodes,
} from "@/web/topic/utils/graph";

// TODO?: this and "getOutgoing..." could be refactored to be one function that takes a direction
export const getIncomingNodesByRelationDescription = (summaryNode: Node, graph: Graph) => {
  const nodeInfoCategory = getNodeInfoCategory(summaryNode.type);

  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data -- seems easiest to do this mutably */
  const sourcesByRelationDescription = graph.edges
    .filter(
      (edge) =>
        edge.target === summaryNode.id && getEdgeInfoCategory(edge.label) === nodeInfoCategory,
    )
    .reduce<Record<string, Node[]>>((acc, incomingEdge) => {
      const incomingNode = findNodeOrThrow(incomingEdge.source, graph.nodes);
      const relationDescription = getDirectedRelationDescription({
        source: incomingNode.type,
        name: incomingEdge.label,
        target: summaryNode.type,
        as: "source",
      });
      if (acc[relationDescription] === undefined) acc[relationDescription] = [];
      acc[relationDescription].push(incomingNode);

      return acc;
    }, {});
  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data */

  return sourcesByRelationDescription;
};

export const getOutgoingNodesByRelationDescription = (summaryNode: Node, graph: Graph) => {
  const nodeInfoCategory = getNodeInfoCategory(summaryNode.type);

  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data -- seems easiest to do this mutably */
  const targetsByRelationDescription = graph.edges
    .filter(
      (edge) =>
        edge.source === summaryNode.id && getEdgeInfoCategory(edge.label) === nodeInfoCategory,
    )
    .reduce<Record<string, Node[]>>((acc, sourceEdge) => {
      const targetNode = findNodeOrThrow(sourceEdge.target, graph.nodes);
      const relationDescription = getDirectedRelationDescription({
        source: summaryNode.type,
        name: sourceEdge.label,
        target: targetNode.type,
        as: "target",
      });

      if (acc[relationDescription] === undefined) acc[relationDescription] = [];
      acc[relationDescription].push(targetNode);

      return acc;
    }, {});
  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data */

  return targetsByRelationDescription;
};

// solution
export const componentsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "target", relationNames: ["has"] },
];

// TODO: test this
export const getComponents = (summaryNode: Node, graph: Graph) => {
  const components = downstreamNodes(summaryNode, graph, ["has"]);

  return splitNodesByDirectAndIndirect(components);
};

export const addressedDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "target", relationNames: ["addresses", "mitigates"] },
];

export const getAddressed = (summaryNode: Node, graph: Graph) => {
  const addressed = downstreamNodes(
    summaryNode,
    graph,
    ["has", "creates"],
    ["addresses", "mitigates"],
  );

  return splitNodesByDirectAndIndirect(addressed);
};

export const obstaclesDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "source", relationNames: ["obstacleOf"], toNodeTypes: badNodeTypes },
];

// TODO: test this
export const getObstacles = (summaryNode: Node, graph: Graph) => {
  const directObstacles = upstreamNodes(summaryNode, graph, [], ["obstacleOf"]); // empty edgesToTraverse because we only want direct obstacles
  const directObstaclesIds = directObstacles.map((node) => node.id);

  const componentsAndDetriments = downstreamNodes(
    summaryNode,
    graph,
    ["has", "creates"],
    undefined,
    ["solutionComponent", "detriment"],
  ).sort((node1, node2) => node1.layersAway - node2.layersAway); // ensure indirect obstacles are sorted by how far away they are, for convenience

  const indirectObstacles = componentsAndDetriments
    .flatMap((node) => upstreamNodes(node, graph, [], ["obstacleOf"]))
    .filter((node) => !directObstaclesIds.includes(node.id));

  return { directNodes: directObstacles, indirectNodes: indirectObstacles };
};

// problem
export const solutionsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "source", relationNames: ["addresses", "mitigates"] },
];

export const getSolutions = (summaryNode: Node, graph: Graph) => {
  const concerns = upstreamNodes(
    summaryNode,
    graph,
    ["causes", "subproblemOf", "createdBy"],
    undefined,
    badNodeTypes,
  );
  const concernSolutions = concerns.flatMap((concern) =>
    upstreamNodes(concern, graph, ["addresses", "mitigates"], ["addresses", "mitigates"]),
  );

  const immediateSolutions = upstreamNodes(summaryNode, graph, [], ["addresses", "mitigates"]);
  const indirectSolutions = immediateSolutions.flatMap((solution) =>
    upstreamNodes(solution, graph, ["has", "creates"]),
  );

  const solutions = uniqBy(
    [
      // not sure if these are worth including but seems fine for now
      ...concernSolutions,
      ...immediateSolutions,
      ...indirectSolutions,
    ],
    (node) => node.id,
  );

  return {
    directNodes: immediateSolutions,
    indirectNodes: solutions.filter((node) => !immediateSolutions.includes(node)), // don't need to exclude by id because `solutions` was created from `immediateSolutions`, so the objects will be referentially equal
  };
};

// effect
export const solutionBenefitsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "target", relationNames: ["creates"], toNodeTypes: ["benefit"] },
];

export const getSolutionBenefits = (summaryNode: Node, graph: Graph) => {
  const benefits = downstreamNodes(
    summaryNode,
    graph,
    ["has", "creates"],
    ["creates"],
    ["benefit"],
  );

  return splitNodesByDirectAndIndirect(benefits);
};

export const detrimentsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "target", relationNames: ["creates", "causes"], toNodeTypes: badNodeTypes },
  { toDirection: "source", relationNames: ["createdBy"], toNodeTypes: badNodeTypes },
];

// TODO: test this
export const getDetriments = (summaryNode: Node, graph: Graph) => {
  const detriments = [
    ...downstreamNodes(
      summaryNode,
      graph,
      ["has", "creates", "causes"],
      ["creates", "causes"],
      badNodeTypes,
    ),
    ...upstreamNodes(summaryNode, graph, ["createdBy"], ["createdBy"], badNodeTypes),
  ];

  return splitNodesByDirectAndIndirect(detriments);
};

export const effectsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "target", relationNames: ["creates", "causes"] },
  { toDirection: "source", relationNames: ["createdBy"] },
];

// TODO: test this
export const getEffects = (summaryNode: Node, graph: Graph) => {
  const effects = [
    ...downstreamNodes(summaryNode, graph, ["has", "creates", "causes"], ["creates", "causes"]),
    ...upstreamNodes(summaryNode, graph, ["createdBy"], ["createdBy"]),
  ];

  return splitNodesByDirectAndIndirect(effects);
};

export const causesDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "target", relationNames: ["createdBy"] },
  { toDirection: "source", relationNames: ["has", "causes", "creates"] },
];

// TODO: test this
export const getCauses = (summaryNode: Node, graph: Graph) => {
  const causes = [
    ...downstreamNodes(summaryNode, graph, ["createdBy"], ["createdBy"]),
    ...upstreamNodes(
      summaryNode,
      graph,
      ["has", "causes", "creates"],
      ["has", "causes", "creates"],
    ),
  ];

  return splitNodesByDirectAndIndirect(causes);
};
