/**
 * The directed search relations in this file are kept here, near the aspect filter
 * functions, because they should match the relations used via `ancestors` and
 * `descendants` in these filter functions.
 */

import { uniqBy } from "es-toolkit";

import { getEdgeInfoCategory } from "@/common/edge";
import { badNodeTypes, getNodeInfoCategory } from "@/common/node";
import { DirectedSearchRelation, getDirectedRelationDescription } from "@/web/topic/utils/edge";
import {
  Graph,
  Node,
  ancestors,
  descendants,
  findNodeOrThrow,
  splitNodesByDirectAndIndirect,
} from "@/web/topic/utils/graph";

// TODO?: this and "getOutgoing..." could be refactored to be one function that takes a direction
export const getIncomingNodesByRelationDescription = (summaryNode: Node, graph: Graph) => {
  const nodeInfoCategory = getNodeInfoCategory(summaryNode.type);

  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data -- seems easiest to do this mutably */
  const childrenByRelationDescription = graph.edges
    .filter(
      (edge) =>
        edge.source === summaryNode.id && getEdgeInfoCategory(edge.label) === nodeInfoCategory,
    )
    .reduce<Record<string, Node[]>>((acc, childEdge) => {
      const childNode = findNodeOrThrow(childEdge.target, graph.nodes);
      const relationDescription = getDirectedRelationDescription({
        child: childNode.type,
        name: childEdge.label,
        parent: summaryNode.type,
        as: "child",
      });
      if (acc[relationDescription] === undefined) acc[relationDescription] = [];
      acc[relationDescription].push(childNode);

      return acc;
    }, {});
  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data */

  return childrenByRelationDescription;
};

export const getOutgoingNodesByRelationDescription = (summaryNode: Node, graph: Graph) => {
  const nodeInfoCategory = getNodeInfoCategory(summaryNode.type);

  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data -- seems easiest to do this mutably */
  const parentsByRelationDescription = graph.edges
    .filter(
      (edge) =>
        edge.target === summaryNode.id && getEdgeInfoCategory(edge.label) === nodeInfoCategory,
    )
    .reduce<Record<string, Node[]>>((acc, parentEdge) => {
      const parentNode = findNodeOrThrow(parentEdge.source, graph.nodes);
      const relationDescription = getDirectedRelationDescription({
        child: summaryNode.type,
        name: parentEdge.label,
        parent: parentNode.type,
        as: "parent",
      });

      if (acc[relationDescription] === undefined) acc[relationDescription] = [];
      acc[relationDescription].push(parentNode);

      return acc;
    }, {});
  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data */

  return parentsByRelationDescription;
};

// solution
export const componentsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "parent", relationNames: ["has"] },
];

// TODO: test this
export const getComponents = (summaryNode: Node, graph: Graph) => {
  const components = ancestors(summaryNode, graph, ["has"]);

  return splitNodesByDirectAndIndirect(components);
};

export const addressedDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "parent", relationNames: ["addresses"] },
];

export const getAddressed = (summaryNode: Node, graph: Graph) => {
  const addressed = ancestors(summaryNode, graph, ["has", "creates"], ["addresses"]);

  return splitNodesByDirectAndIndirect(addressed);
};

export const obstaclesDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "child", relationNames: ["obstacleOf"], toNodeTypes: badNodeTypes },
];

// TODO: test this
export const getObstacles = (summaryNode: Node, graph: Graph) => {
  const directObstacles = descendants(summaryNode, graph, [], ["obstacleOf"]); // empty edgesToTraverse because we only want direct obstacles
  const directObstaclesIds = directObstacles.map((node) => node.id);

  const componentsAndDetriments = ancestors(summaryNode, graph, ["has", "creates"], undefined, [
    "solutionComponent",
    "detriment",
  ]).sort((node1, node2) => node1.layersAway - node2.layersAway); // ensure indirect obstacles are sorted by how far away they are, for convenience

  const indirectObstacles = componentsAndDetriments
    .flatMap((node) => descendants(node, graph, [], ["obstacleOf"]))
    .filter((node) => !directObstaclesIds.includes(node.id));

  return { directNodes: directObstacles, indirectNodes: indirectObstacles };
};

// problem
export const solutionsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "child", relationNames: ["addresses", "mitigates"] },
];

export const getSolutions = (summaryNode: Node, graph: Graph) => {
  const concerns = descendants(
    summaryNode,
    graph,
    ["causes", "subproblemOf", "createdBy"],
    undefined,
    badNodeTypes,
  );
  const concernSolutions = concerns.flatMap((concern) =>
    descendants(concern, graph, ["addresses", "mitigates"], ["addresses", "mitigates"]),
  );

  const immediateSolutions = descendants(summaryNode, graph, [], ["addresses", "mitigates"]);
  const indirectSolutions = immediateSolutions.flatMap((solution) =>
    descendants(solution, graph, ["has", "creates"]),
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

  return splitNodesByDirectAndIndirect(solutions);
};

// effect
export const solutionBenefitsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "parent", relationNames: ["creates"], toNodeTypes: ["benefit"] },
];

export const getSolutionBenefits = (summaryNode: Node, graph: Graph) => {
  const benefits = ancestors(summaryNode, graph, ["has", "creates"], ["creates"], ["benefit"]);

  return splitNodesByDirectAndIndirect(benefits);
};

export const detrimentsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "parent", relationNames: ["creates", "causes"], toNodeTypes: badNodeTypes },
  { toDirection: "child", relationNames: ["createdBy"], toNodeTypes: badNodeTypes },
];

// TODO: test this
export const getDetriments = (summaryNode: Node, graph: Graph) => {
  const detriments = [
    ...ancestors(
      summaryNode,
      graph,
      ["has", "creates", "causes"],
      ["creates", "causes"],
      badNodeTypes,
    ),
    ...descendants(summaryNode, graph, ["createdBy"], ["createdBy"], badNodeTypes),
  ];

  return splitNodesByDirectAndIndirect(detriments);
};

export const effectsDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "parent", relationNames: ["creates", "causes"] },
  { toDirection: "child", relationNames: ["createdBy"] },
];

// TODO: test this
export const getEffects = (summaryNode: Node, graph: Graph) => {
  const effects = [
    ...ancestors(summaryNode, graph, ["has", "creates", "causes"], ["creates", "causes"]),
    ...descendants(summaryNode, graph, ["createdBy"], ["createdBy"]),
  ];

  return splitNodesByDirectAndIndirect(effects);
};

export const causesDirectedSearchRelations: DirectedSearchRelation[] = [
  { toDirection: "parent", relationNames: ["createdBy"] },
  { toDirection: "child", relationNames: ["has", "causes", "creates"] },
];

// TODO: test this
export const getCauses = (summaryNode: Node, graph: Graph) => {
  const causes = [
    ...ancestors(summaryNode, graph, ["createdBy"], ["createdBy"]),
    ...descendants(summaryNode, graph, ["has", "causes", "creates"], ["has", "causes", "creates"]),
  ];

  return splitNodesByDirectAndIndirect(causes);
};
