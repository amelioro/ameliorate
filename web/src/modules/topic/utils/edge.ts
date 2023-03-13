import _ from "lodash";

import { Diagram, Edge, Node, RelationDirection, findArguable } from "./diagram";
import { NodeType } from "./nodes";

export type RelationName =
  | "causes"
  | "solves"
  | "created by"
  | "has"
  | "criterion for"
  | "embodies"
  | "supports"
  | "critiques";

// assumes that we're always pointing from child to parent
export const relations = [
  { child: "problem", name: "causes", parent: "problem" },
  { child: "solution", name: "solves", parent: "problem" },
  { child: "solutionComponent", name: "solves", parent: "problem" },

  { child: "problem", name: "created by", parent: "solution" },
  { child: "problem", name: "created by", parent: "solutionComponent" },
  { child: "solution", name: "has", parent: "solutionComponent" },

  { child: "criterion", name: "criterion for", parent: "problem" },
  { child: "solution", name: "embodies", parent: "criterion" },
  { child: "solutionComponent", name: "embodies", parent: "criterion" },

  { child: "support", name: "supports", parent: "rootClaim" },
  { child: "critique", name: "critiques", parent: "rootClaim" },

  { child: "support", name: "supports", parent: "support" },
  { child: "critique", name: "critiques", parent: "support" },

  { child: "support", name: "supports", parent: "critique" },
  { child: "critique", name: "critiques", parent: "critique" },
] as const;

export type Relation = typeof relations[number];

export const claimNodeTypes = ["RootClaim", "Support", "Critique"];

export const getRelation = (parent: NodeType, child: NodeType): Relation | undefined => {
  return relations.find((relation) => relation.parent === parent && relation.child === child);
};

export const implicitEdgeTypes: { throughNodeType: NodeType; relation: Relation }[] = [
  {
    throughNodeType: "criterion",
    relation: { child: "solutionComponent", name: "solves", parent: "problem" },
  },
  {
    throughNodeType: "criterion",
    relation: { child: "solution", name: "solves", parent: "problem" },
  },
];

type AddableNodes = {
  [key in RelationDirection]: NodeType[];
};
const addableNodesFor: Record<NodeType, AddableNodes> = {
  problem: {
    parent: ["problem", "solution"],
    child: ["problem", "solution", "criterion"],
  },
  solution: {
    parent: ["problem", "solutionComponent"], // could have criteria, but need to select a specific problem for it & that requires design
    child: ["problem"],
  },
  solutionComponent: {
    parent: ["problem"],
    child: ["problem"],
  },

  // can't have multiple problems;
  // could have multiple solutions but unintuitive to add from criterion because solution would be tied to parent & all sibling criteria
  criterion: { parent: [], child: [] },

  // claim diagram is a tree so claim nodes can't add parents
  rootClaim: { parent: [], child: ["support", "critique"] },
  support: { parent: [], child: ["support", "critique"] },
  critique: { parent: [], child: ["support", "critique"] },
};

export const addableRelationsFrom = (nodeType: NodeType, addingAs: RelationDirection) => {
  const fromDirection = addingAs === "parent" ? "child" : "parent";
  const addableNodes = addableNodesFor[nodeType][addingAs];

  const addableRelations = relations.filter(
    (relation) => addableNodes.includes(relation[addingAs]) && relation[fromDirection] === nodeType
  );

  const formattedRelations = addableRelations.map((relation) => ({
    toNodeType: relation[addingAs],
    relation: relation.name,
  }));

  return formattedRelations;
};

export const canCreateEdge = (diagram: Diagram, parent: Node, child: Node) => {
  const relation = getRelation(parent.type, child.type);

  const existingEdge = diagram.edges.find((edge) => {
    return (
      (edge.source === parent.id && edge.target === child.id) ||
      (edge.source === child.id && edge.target === parent.id)
    );
  });

  if (parent.id === child.id) {
    console.log("cannot connect nodes: tried dragging node onto itself");
    return false;
  }

  if (existingEdge) {
    console.log("cannot connect nodes: tried dragging between already-connected nodes");
    return false;
  }

  if (claimNodeTypes.includes(parent.type)) {
    console.log("cannot connect nodes: claim diagram is a tree so claim nodes can't add parents");
    return false;
  }

  if (
    (parent.type === "criterion" || child.type === "criterion") &&
    [parent.type, child.type].some((type) => type === "problem" || type === "solution")
  ) {
    console.log(
      "cannot connect nodes: criteria is always already connected to as many problems & solutions as it can"
    );
    return false;
  }

  if (!relation) {
    console.log("cannot connect nodes: nodes don't form a valid relation");
    return false;
  }

  return true;
};

export const parentNode = (edge: Edge, diagram: Diagram) => {
  return findArguable(diagram, edge.source, "node");
};

export const childNode = (edge: Edge, diagram: Diagram) => {
  return findArguable(diagram, edge.target, "node");
};

export const getConnectingEdge = (node1: Node, node2: Node, edges: Edge[]) => {
  const edge = edges.find(
    (edge) =>
      (edge.source === node1.id && edge.target === node2.id) ||
      (edge.source === node2.id && edge.target === node1.id)
  );

  return edge;
};
