import { RelationName, claimRelationNames, relationNames } from "../../../common/edge";
import { NodeType, claimNodeTypes, nodeTypes } from "../../../common/node";
import { hasClaims } from "./claim";
import { Diagram } from "./diagram";
import { Edge, Graph, Node, RelationDirection, findNode } from "./graph";
import { children, components, parents } from "./node";

const questionRelations: Relation[] = [...nodeTypes, ...relationNames].map((partType) => ({
  child: "question",
  name: "asksAbout",
  parent: partType,
}));

const factRelations: Relation[] = [...nodeTypes, ...relationNames]
  .filter(
    (partType) =>
      partType !== "fact" &&
      partType !== "source" &&
      partType !== "relevantFor" &&
      partType !== "sourceOf"
  )
  .map((partType) => ({
    child: "fact",
    name: "relevantFor",
    parent: partType,
  }));

const sourceRelations: Relation[] = [...nodeTypes, ...relationNames]
  .filter(
    (partType) =>
      partType !== "fact" &&
      partType !== "source" &&
      partType !== "relevantFor" &&
      partType !== "sourceOf"
  )
  .map((nodeType) => ({
    child: "source",
    name: "relevantFor",
    parent: nodeType,
  }));

const exploreRelations: Relation[] = questionRelations.concat(factRelations, sourceRelations, [
  { child: "answer", name: "potentialAnswerTo", parent: "question" },
  { child: "source", name: "sourceOf", parent: "fact" },
]);

// Assumes that we're always pointing from child to parent.
// This list is sorted by `parent` and then `child` so that it matches the partition order of nodes
// in the layout.
export const relations: Relation[] = exploreRelations.concat([
  // topic relations
  { child: "problem", name: "causes", parent: "problem" },
  { child: "criterion", name: "criterionFor", parent: "problem" },
  { child: "effect", name: "addresses", parent: "problem" },
  { child: "solutionComponent", name: "addresses", parent: "problem" },
  { child: "solution", name: "addresses", parent: "problem" },

  { child: "effect", name: "embodies", parent: "criterion" },
  { child: "solutionComponent", name: "embodies", parent: "criterion" },
  { child: "solution", name: "embodies", parent: "criterion" },

  { child: "problem", name: "createdBy", parent: "effect" },
  { child: "solutionComponent", name: "creates", parent: "effect" },
  { child: "solution", name: "creates", parent: "effect" },

  { child: "problem", name: "createdBy", parent: "solutionComponent" },
  { child: "solution", name: "has", parent: "solutionComponent" },

  { child: "problem", name: "createdBy", parent: "solution" },
  { child: "solution", name: "accomplishes", parent: "solution" },

  // claim relations
  { child: "support", name: "supports", parent: "rootClaim" },
  { child: "critique", name: "critiques", parent: "rootClaim" },

  { child: "support", name: "supports", parent: "support" },
  { child: "critique", name: "critiques", parent: "support" },

  { child: "support", name: "supports", parent: "critique" },
  { child: "critique", name: "critiques", parent: "critique" },
]);

export interface Relation {
  child: NodeType;
  name: RelationName;
  // right now, only parents can point to other edges, but this could change if need be
  parent: NodeType | RelationName;
}

export const getRelation = (
  parent: NodeType | RelationName,
  child: NodeType,
  relationName?: RelationName
): Relation | undefined => {
  const relation = relationName
    ? relations.find(
        (relation) =>
          relation.parent === parent && relation.child === child && relation.name === relationName
      )
    : relations.find((relation) => relation.parent === parent && relation.child === child);

  // we're assuming that anything can relate to anything else; potentially this should only be true when unrestricted editing is on
  return relation ?? { child, name: "relatesTo", parent };
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
 * e.g. a criterion is a detour for a solution-addresses-problem relation because if a solution embodies
 * the criterion and the criterion is for a problem, then the solution addresses the problem
 */
export const shortcutRelations: ShortcutRelation[] = [
  {
    detourNodeType: "criterion",
    relation: { child: "solution", name: "addresses", parent: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { child: "solutionComponent", name: "addresses", parent: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { child: "effect", name: "addresses", parent: "problem" },
  },
];

type AddableNodes = {
  [key in RelationDirection]: NodeType[];
};
const addableNodesFor: Record<NodeType, AddableNodes> = {
  problem: {
    parent: ["problem", "solution"],
    child: ["problem", "criterion", "solution"],
  },

  // can't have multiple problems;
  // could have multiple solutions but unintuitive to add from criterion because solution would be tied to parent & all sibling criteria
  criterion: { parent: [], child: [] },

  effect: { parent: [], child: ["problem"] },

  solutionComponent: {
    parent: ["problem", "effect"],
    child: ["problem"],
  },
  solution: {
    parent: ["problem", "effect", "solutionComponent"], // could have criteria, but need to select a specific problem for it & that requires design
    child: ["problem", "solution"],
  },

  // explore nodes
  question: { parent: [], child: ["question", "answer", "fact", "source"] },
  answer: { parent: [], child: ["question", "fact", "source"] },
  fact: { parent: [], child: ["question", "source"] },
  source: { parent: ["fact"], child: ["question"] },

  // claims are in a tree so claim nodes can't add parents
  rootClaim: { parent: [], child: ["support", "critique"] },
  support: { parent: [], child: ["support", "critique"] },
  critique: { parent: [], child: ["support", "critique"] },

  // generic - will always add via unrestricted mode
  custom: { parent: [], child: [] },
};

export const addableRelationsFrom = (nodeType: NodeType, addingAs: RelationDirection) => {
  const fromDirection = addingAs === "parent" ? "child" : "parent";
  const addableNodes = addableNodesFor[nodeType][addingAs];

  const addableRelations = relations.filter(
    (relation) =>
      addableNodes.includes(relation[addingAs] as NodeType) && relation[fromDirection] === nodeType
  );

  const formattedRelations = addableRelations.map((relation) => ({
    toNodeType: relation[addingAs] as NodeType,
    relation,
  }));

  return formattedRelations;
};

export const canCreateEdge = (topicGraph: Graph, parent: Node, child: Node) => {
  const relation = getRelation(parent.type, child.type);

  const existingEdge = topicGraph.edges.find((edge) => {
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

  const secondParentForClaim =
    claimNodeTypes.includes(child.type) &&
    topicGraph.edges.find((edge) => edge.target === child.id);
  if (secondParentForClaim) {
    console.log("cannot connect nodes: claims are in a tree so can't have multiple parents");
    return false;
  }

  if (!relation) {
    console.log("cannot connect nodes: nodes don't form a valid relation");
    return false;
  }

  return true;
};

export const parentNode = (edge: Edge, nodes: Node[]) => {
  return findNode(edge.source, nodes);
};

export const childNode = (edge: Edge, nodes: Node[]) => {
  return findNode(edge.target, nodes);
};

export const nodes = (edge: Edge, nodes: Node[]) => {
  return [parentNode(edge, nodes), childNode(edge, nodes)];
};

export const getConnectingEdge = (graphPartId1: string, graphPartId2: string, edges: Edge[]) => {
  const edge = edges.find(
    (edge) =>
      (edge.source === graphPartId1 && edge.target === graphPartId2) ||
      (edge.source === graphPartId2 && edge.target === graphPartId2)
  );

  return edge;
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
export const isEdgeAShortcut = (edge: Edge, topicGraph: Graph) => {
  const edgeParent = parentNode(edge, topicGraph.nodes);
  const edgeChild = childNode(edge, topicGraph.nodes);

  return shortcutRelations.some((shortcutRelation) => {
    const edgeCouldBeAShortcut =
      edgeParent.type === shortcutRelation.relation.parent &&
      edgeChild.type === shortcutRelation.relation.child;

    if (!edgeCouldBeAShortcut) return false;

    const childrenOfParent = children(edgeParent, topicGraph);
    const parentsOfChild = parents(edgeChild, topicGraph);

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
export const isEdgeImpliedByComposition = (edge: Edge, topicGraph: Graph) => {
  const edgeParent = parentNode(edge, topicGraph.nodes);
  const edgeChild = childNode(edge, topicGraph.nodes);

  // check implied through parent
  const componentsOfParent = components(edgeParent, topicGraph);
  const impliedThroughParentComponent = componentsOfParent.some((component) => {
    return topicGraph.edges.some(
      (edge) =>
        edge.source === component.id && edge.label === edge.label && edge.target === edgeChild.id
    );
  });

  if (impliedThroughParentComponent) return true;

  // check implied through child
  const componentsOfChild = components(edgeChild, topicGraph);
  const impliedThroughChildComponent = componentsOfChild.some((component) => {
    return topicGraph.edges.some(
      (edge) =>
        edge.target === component.id && edge.label === edge.label && edge.source === edgeParent.id
    );
  });

  return impliedThroughChildComponent;
};

// Implied edges feel a little jank.
//
// Previously an edge was no longer implied if it had a score, but scores became user-specific, and
// edges should not be implied based on the user viewing them.
//
// We don't want users to apply scores and then never see them again due to an implied edge being
// hidden. The button to show implied edges should reduce this pain, but maybe we need a better view
// to reduce the need to hide implied edges?
export const isEdgeImplied = (edge: Edge, displayDiagram: Diagram, claimEdges: Edge[]) => {
  if (claimRelationNames.includes(edge.label)) return false; // claims can't be implied
  if (hasClaims(edge, claimEdges)) return false;

  return isEdgeAShortcut(edge, displayDiagram) || isEdgeImpliedByComposition(edge, displayDiagram);
};
