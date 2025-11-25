/**
 * The directed search relations in this file are kept here, near the aspect filter
 * functions, because they should match the relations used via `upstreamNodes` and
 * `downstreamNodes` in these filter functions.
 */

import { uniqBy } from "es-toolkit";

import {
  getEdgeInfoCategory,
  justificationRelationNames,
  researchRelationNames,
} from "@/common/edge";
import { badNodeTypes, getNodeInfoCategory } from "@/common/node";
import { type Aspect } from "@/web/summary/summary";
import { DirectedSearchRelation, getDirectedRelationDescription } from "@/web/topic/utils/edge";
import {
  Graph,
  Node,
  downstreamNodes,
  findNodeOrThrow,
  splitNodesByDirectAndIndirect,
  upstreamNodes,
} from "@/web/topic/utils/graph";

/**
 * Return nodes for a given aspect of a summary node.
 *
 * Somewhat awkward return value because the incoming/outgoing aspects don't always make sense
 * without having their relations, where the other aspects do.
 *
 * Example cases that want this method:
 * - displaying aspects in the diagram (e.g. for focused nodes feature, not yet implemented) only
 * needs the nodes, because relations are automatically added
 * - sharing aspects via JSON (e.g. for LLM to more-easily understand relations that each node has);
 * incoming/outgoing won't make sense here (e.g. solution outgoing: Benefit, Problem) without
 * relations specified (e.g. solution outgoing: creates Benefit, addresses Problem)
 *
 * So we're just returning direct nodes OR direct nodes by relation description, then the diagram
 * can flatmap everything, and we handle both cases separately for JSON.
 */
export const getAspectNodes = (
  summaryNode: Node,
  graph: Graph,
  aspect: Aspect,
):
  | { directNodes: Node[]; indirectNodes: Node[]; nodesByRelationDescription?: undefined }
  | {
      directNodes?: undefined;
      indirectNodes?: undefined;
      nodesByRelationDescription: Record<string, Node[]>;
    } => {
  if (aspect === "incoming")
    return {
      nodesByRelationDescription: getIncomingNodesByRelationDescription(summaryNode, graph),
    };
  else if (aspect === "outgoing")
    return {
      nodesByRelationDescription: getOutgoingNodesByRelationDescription(summaryNode, graph),
    };
  else if (aspect === "components") return getComponents(summaryNode, graph);
  else if (aspect === "addressed") return getAddressed(summaryNode, graph);
  else if (aspect === "obstacles") return getObstacles(summaryNode, graph);
  else if (aspect === "motivation") return getMotivation(summaryNode, graph);
  else if (aspect === "solutionConcerns") return getSolutionConcerns(summaryNode, graph);
  else if (aspect === "solutions") return getSolutions(summaryNode, graph);
  else if (aspect === "benefits") return getSolutionBenefits(summaryNode, graph);
  else if (aspect === "detriments") return getDetriments(summaryNode, graph);
  else if (aspect === "effects") return getEffects(summaryNode, graph);
  else if (aspect === "causes") return getCauses(summaryNode, graph);
  else if (aspect === "justification") return getJustification(summaryNode, graph);
  else if (aspect === "research") return getResearch(summaryNode, graph);
  else if (aspect === "isAbout") return getIsAbout(summaryNode, graph);
  else {
    throw new Error(
      `unhandled aspect ${aspect} - note: topic aspects e.g. coreNodes are not supported`,
    );
  }
};

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

export const getMotivation = (summaryNode: Node, graph: Graph) => {
  const { directNodes: directBenefits, indirectNodes: indirectBenefits } = getSolutionBenefits(
    summaryNode,
    graph,
  );
  const { directNodes: directAddressed, indirectNodes: indirectAddressed } = getAddressed(
    summaryNode,
    graph,
  );

  return {
    directNodes: [...directBenefits, ...directAddressed],
    indirectNodes: [...indirectBenefits, ...indirectAddressed],
  };
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

export const getSolutionConcerns = (summaryNode: Node, graph: Graph) => {
  const { directNodes: directDetriments, indirectNodes: indirectDetriments } = getDetriments(
    summaryNode,
    graph,
  );
  const { directNodes: directObstacles, indirectNodes: indirectObstacles } = getObstacles(
    summaryNode,
    graph,
  );

  return {
    directNodes: [...directDetriments, ...directObstacles],
    indirectNodes: [...indirectDetriments, ...indirectObstacles],
  };
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

// justification / research

// no directed search relations for justification because root claims make it complicated

export const getJustification = (summaryNode: Node, graph: Graph) => {
  const directRootClaims = graph.nodes.filter(
    (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === summaryNode.id,
  );

  const indirectClaimsThroughRootClaims = directRootClaims.flatMap((rootClaim) =>
    upstreamNodes(rootClaim, graph, ["supports", "critiques"], ["supports", "critiques"]),
  );

  const claimsThroughThisNode = upstreamNodes(
    summaryNode,
    graph,
    ["supports", "critiques"],
    ["supports", "critiques"],
  );

  const { directNodes: directThroughThisNode, indirectNodes: indirectThroughThisNode } =
    splitNodesByDirectAndIndirect(claimsThroughThisNode);

  return {
    directNodes: [...directRootClaims, ...directThroughThisNode],
    indirectNodes: [...indirectClaimsThroughRootClaims, ...indirectThroughThisNode],
  };
};

export const researchDirectedSearchRelations: DirectedSearchRelation[] = [
  {
    toDirection: "source",
    relationNames: ["asksAbout", "potentialAnswerTo", "relevantFor", "sourceOf", "mentions"],
  },
];

export const getResearch = (summaryNode: Node, graph: Graph) => {
  const research = upstreamNodes(
    summaryNode,
    graph,
    ["asksAbout", "potentialAnswerTo", "relevantFor", "sourceOf", "mentions"],
    ["asksAbout", "potentialAnswerTo", "relevantFor", "sourceOf", "mentions"],
  );

  return splitNodesByDirectAndIndirect(research);
};

// No isAbout directed search relations because root claims make it complicated

export const getIsAbout = (summaryNode: Node, graph: Graph) => {
  // because there isn't a direct relation from root claim to its parent part being argued
  const rootClaimIsAboutNode =
    summaryNode.type === "rootClaim"
      ? graph.nodes.find((node) => node.id === summaryNode.data.arguedDiagramPartId)
      : undefined;

  if (rootClaimIsAboutNode) return { directNodes: [rootClaimIsAboutNode], indirectNodes: [] };

  const isAboutNodes = downstreamNodes(
    summaryNode,
    graph,
    [], // we only want nodes we're directly referencing
    researchRelationNames.concat(justificationRelationNames), // should work for both research and justification nodes
  );

  return { directNodes: isAboutNodes, indirectNodes: [] };
};
