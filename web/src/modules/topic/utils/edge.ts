import _ from "lodash";

import { Diagram, Edge, Node, RelationDirection, findNode } from "./diagram";
import { NodeType, children, components, parents } from "./node";

export type RelationName =
  | "causes"
  | "solves"
  | "created by"
  | "has"
  | "criterion for"
  | "creates"
  | "embodies"
  | "supports"
  | "critiques";

// assumes that we're always pointing from child to parent
export const relations = [
  { child: "problem", name: "causes", parent: "problem" },
  { child: "solution", name: "solves", parent: "problem" },
  { child: "solutionComponent", name: "solves", parent: "problem" },
  { child: "effect", name: "solves", parent: "problem" },

  { child: "problem", name: "created by", parent: "solution" },
  { child: "problem", name: "created by", parent: "solutionComponent" },
  { child: "problem", name: "created by", parent: "effect" },
  { child: "solution", name: "has", parent: "solutionComponent" },
  { child: "solution", name: "creates", parent: "effect" },
  { child: "solutionComponent", name: "creates", parent: "effect" },

  { child: "criterion", name: "criterion for", parent: "problem" },
  { child: "solution", name: "embodies", parent: "criterion" },
  { child: "solutionComponent", name: "embodies", parent: "criterion" },
  { child: "effect", name: "embodies", parent: "criterion" },

  { child: "support", name: "supports", parent: "rootClaim" },
  { child: "critique", name: "critiques", parent: "rootClaim" },

  { child: "support", name: "supports", parent: "support" },
  { child: "critique", name: "critiques", parent: "support" },

  { child: "support", name: "supports", parent: "critique" },
  { child: "critique", name: "critiques", parent: "critique" },
] as const;

export type Relation = typeof relations[number];

export const claimNodeTypes = ["RootClaim", "Support", "Critique"];

export const getRelation = (
  parent: NodeType,
  child: NodeType,
  relationName?: RelationName
): Relation | undefined => {
  if (relationName) {
    return relations.find(
      (relation) =>
        relation.parent === parent && relation.child === child && relation.name === relationName
    );
  } else {
    return relations.find((relation) => relation.parent === parent && relation.child === child);
  }
};

export const composedRelations: Relation[] = [
  { child: "solution", name: "has", parent: "solutionComponent" },
];

export const componentTypes = composedRelations.map((relation) => relation.parent);

interface ShortcutRelation {
  detourNodeType: NodeType;
  relation: Relation;
}

/**
 * Shortcut relations are implied through detour nodes.
 *
 * e.g. a criterion is a detour for a solution-solves-problem relation because if a solution embodies
 * the criterion and the criterion is for a problem, then the solution solves the problem
 */
export const shortcutRelations: ShortcutRelation[] = [
  {
    detourNodeType: "criterion",
    relation: { child: "solution", name: "solves", parent: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { child: "solutionComponent", name: "solves", parent: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { child: "effect", name: "solves", parent: "problem" },
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
    parent: ["problem", "solutionComponent", "effect"], // could have criteria, but need to select a specific problem for it & that requires design
    child: ["problem"],
  },
  solutionComponent: {
    parent: ["problem", "effect"],
    child: ["problem"],
  },

  // can't have multiple problems;
  // could have multiple solutions but unintuitive to add from criterion because solution would be tied to parent & all sibling criteria
  criterion: { parent: [], child: [] },

  effect: { parent: [], child: ["problem"] },

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
    relation,
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

  if (!relation) {
    console.log("cannot connect nodes: nodes don't form a valid relation");
    return false;
  }

  return true;
};

export const parentNode = (edge: Edge, diagram: Diagram) => {
  return findNode(diagram, edge.source);
};

export const childNode = (edge: Edge, diagram: Diagram) => {
  return findNode(diagram, edge.target);
};

export const getConnectingEdge = (node1: Node, node2: Node, edges: Edge[]) => {
  const edge = edges.find(
    (edge) =>
      (edge.source === node1.id && edge.target === node2.id) ||
      (edge.source === node2.id && edge.target === node1.id)
  );

  return edge;
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
export const isEdgeAShortcut = (edge: Edge, diagram: Diagram) => {
  const edgeParent = parentNode(edge, diagram);
  const edgeChild = childNode(edge, diagram);

  return shortcutRelations.some((shortcutRelation) => {
    const edgeCouldBeAShortcut =
      edgeParent.type === shortcutRelation.relation.parent &&
      edgeChild.type === shortcutRelation.relation.child;

    if (!edgeCouldBeAShortcut) return false;

    const childrenOfParent = children(edgeParent, diagram);
    const parentsOfChild = parents(edgeChild, diagram);

    const detourNodeAsChild = childrenOfParent.find(
      (child) => child.type === shortcutRelation.detourNodeType
    );
    const detourNodeAsParent = parentsOfChild.find(
      (parent) => parent.type === shortcutRelation.detourNodeType
    );

    // note: does not check if detour node is showing - this is so that hidden shortcut edges
    // can still be shown when a detour node is hidden
    const detourNodeConnectsParentAndChild = detourNodeAsChild && detourNodeAsParent;

    return detourNodeConnectsParentAndChild;
  });
};

/**
 * note: does not check if component node is showing - this is so that hidden implied edges
 * can still be shown when a component node is hidden
 */
export const isEdgeImpliedByComposition = (edge: Edge, diagram: Diagram) => {
  const edgeParent = parentNode(edge, diagram);
  const edgeChild = childNode(edge, diagram);

  // check implied through parent
  const componentsOfParent = components(edgeParent, diagram);
  const impliedThroughParentComponent = componentsOfParent.some((component) => {
    return diagram.edges.some(
      (edge) =>
        edge.source === component.id && edge.label === edge.label && edge.target === edgeChild.id
    );
  });

  if (impliedThroughParentComponent) return true;

  // check implied through child
  const componentsOfChild = components(edgeChild, diagram);
  const impliedThroughChildComponent = componentsOfChild.some((component) => {
    return diagram.edges.some(
      (edge) =>
        edge.target === component.id && edge.label === edge.label && edge.source === edgeParent.id
    );
  });

  return impliedThroughChildComponent;
};
