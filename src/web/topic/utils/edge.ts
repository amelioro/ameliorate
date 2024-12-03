import { RelationName, justificationRelationNames } from "@/common/edge";
import { NodeType, justificationNodeTypes, nodeTypes, researchNodeTypes } from "@/common/node";
import { Edge, Graph, Node, RelationDirection, findNodeOrThrow } from "@/web/topic/utils/graph";
import { hasJustification } from "@/web/topic/utils/justification";
import { children, components, parents } from "@/web/topic/utils/node";

const questionRelations: AddableRelation[] = nodeTypes.map((nodeType) => ({
  child: "question",
  name: "asksAbout",
  parent: nodeType,
  addableFrom: researchNodeTypes.includes(nodeType) ? "parent" : "neither",
}));

const factRelations: AddableRelation[] = nodeTypes
  .filter((nodeType) => nodeType !== "fact" && nodeType !== "source")
  .map((nodeType) => ({
    child: "fact",
    name: "relevantFor",
    parent: nodeType,
    addableFrom: researchNodeTypes.includes(nodeType) ? "parent" : "neither",
  }));

const sourceRelations: AddableRelation[] = nodeTypes
  .filter((nodeType) => nodeType !== "fact" && nodeType !== "source")
  .map((nodeType) => ({
    child: "source",
    name: "relevantFor",
    parent: nodeType,
    addableFrom: researchNodeTypes.includes(nodeType) ? "parent" : "neither",
  }));

const researchRelations: AddableRelation[] = questionRelations.concat(
  // ordered this way so that answer add buttons are to the right of question-add and left of fact/source-add
  [
    { child: "answer", name: "potentialAnswerTo", parent: "question", addableFrom: "parent" },
    { child: "answer", name: "accomplishes", parent: "answer", addableFrom: "parent" },
  ],
  factRelations,
  sourceRelations,
  [
    { child: "fact", name: "relatesTo", parent: "fact", addableFrom: "child" }, // allow chaining facts, which feels natural
    { child: "source", name: "sourceOf", parent: "fact", addableFrom: "both" },
    { child: "source", name: "mentions", parent: "source", addableFrom: "child" },
  ],
);

// Assumes that we're always pointing from child to parent.
// This list is sorted by `parent` and then `child` so that it matches the partition order of nodes
// in the layout.
export const relations: AddableRelation[] = researchRelations.concat([
  // topic relations
  { child: "problem", name: "causes", parent: "problem", addableFrom: "child" },
  { child: "cause", name: "causes", parent: "problem", addableFrom: "both" },
  { child: "problem", name: "subproblemOf", parent: "problem", addableFrom: "parent" },
  { child: "benefit", name: "createdBy", parent: "problem", addableFrom: "parent" },
  { child: "effect", name: "createdBy", parent: "problem", addableFrom: "parent" },
  { child: "detriment", name: "createdBy", parent: "problem", addableFrom: "parent" },
  { child: "criterion", name: "criterionFor", parent: "problem", addableFrom: "parent" },
  { child: "solutionComponent", name: "addresses", parent: "problem", addableFrom: "child" },
  { child: "solution", name: "addresses", parent: "problem", addableFrom: "both" },

  { child: "cause", name: "causes", parent: "cause", addableFrom: "parent" },
  { child: "solution", name: "addresses", parent: "cause", addableFrom: "parent" },

  { child: "criterion", name: "relatesTo", parent: "benefit", addableFrom: "neither" },
  { child: "criterion", name: "relatesTo", parent: "effect", addableFrom: "neither" },
  { child: "criterion", name: "relatesTo", parent: "detriment", addableFrom: "neither" },

  // effects, benefits, detriments, can each create each other (when coming up from solution)
  // and be created by each other (when going up to problem)
  { child: "benefit", name: "creates", parent: "benefit", addableFrom: "child" },
  { child: "effect", name: "creates", parent: "benefit", addableFrom: "child" },
  { child: "detriment", name: "creates", parent: "benefit", addableFrom: "child" },
  { child: "benefit", name: "creates", parent: "effect", addableFrom: "child" },
  { child: "effect", name: "creates", parent: "effect", addableFrom: "child" },
  { child: "detriment", name: "creates", parent: "effect", addableFrom: "child" },
  { child: "benefit", name: "creates", parent: "detriment", addableFrom: "child" },
  { child: "effect", name: "creates", parent: "detriment", addableFrom: "child" },
  { child: "detriment", name: "creates", parent: "detriment", addableFrom: "child" },
  { child: "benefit", name: "createdBy", parent: "benefit", addableFrom: "parent" },
  { child: "effect", name: "createdBy", parent: "benefit", addableFrom: "parent" },
  { child: "detriment", name: "createdBy", parent: "benefit", addableFrom: "parent" },
  { child: "benefit", name: "createdBy", parent: "effect", addableFrom: "parent" },
  { child: "effect", name: "createdBy", parent: "effect", addableFrom: "parent" },
  { child: "detriment", name: "createdBy", parent: "effect", addableFrom: "parent" },
  { child: "benefit", name: "createdBy", parent: "detriment", addableFrom: "parent" },
  { child: "effect", name: "createdBy", parent: "detriment", addableFrom: "parent" },
  { child: "detriment", name: "createdBy", parent: "detriment", addableFrom: "parent" },

  { child: "benefit", name: "addresses", parent: "cause", addableFrom: "neither" },

  { child: "benefit", name: "fulfills", parent: "criterion", addableFrom: "neither" },
  { child: "effect", name: "fulfills", parent: "criterion", addableFrom: "neither" },
  { child: "detriment", name: "relatesTo", parent: "criterion", addableFrom: "neither" },
  { child: "solutionComponent", name: "fulfills", parent: "criterion", addableFrom: "neither" },
  { child: "solution", name: "fulfills", parent: "criterion", addableFrom: "neither" },

  { child: "solutionComponent", name: "creates", parent: "benefit", addableFrom: "child" },
  { child: "solution", name: "creates", parent: "benefit", addableFrom: "child" },
  { child: "solutionComponent", name: "creates", parent: "effect", addableFrom: "child" },
  { child: "solution", name: "creates", parent: "effect", addableFrom: "child" },
  { child: "solutionComponent", name: "creates", parent: "detriment", addableFrom: "child" },
  { child: "solution", name: "creates", parent: "detriment", addableFrom: "child" },

  { child: "solution", name: "addresses", parent: "detriment", addableFrom: "parent" },

  { child: "solution", name: "has", parent: "solutionComponent", addableFrom: "child" },
  { child: "solutionComponent", name: "has", parent: "solutionComponent", addableFrom: "child" },
  { child: "obstacle", name: "obstacleOf", parent: "solutionComponent", addableFrom: "parent" },

  { child: "solution", name: "accomplishes", parent: "solution", addableFrom: "parent" },
  { child: "solution", name: "contingencyFor", parent: "solution", addableFrom: "neither" },
  { child: "obstacle", name: "obstacleOf", parent: "solution", addableFrom: "parent" },

  { child: "solution", name: "addresses", parent: "obstacle", addableFrom: "parent" },

  // justification relations
  { child: "support", name: "supports", parent: "rootClaim", addableFrom: "parent" },
  { child: "critique", name: "critiques", parent: "rootClaim", addableFrom: "parent" },

  { child: "support", name: "supports", parent: "support", addableFrom: "parent" },
  { child: "critique", name: "critiques", parent: "support", addableFrom: "parent" },

  { child: "support", name: "supports", parent: "critique", addableFrom: "parent" },
  { child: "critique", name: "critiques", parent: "critique", addableFrom: "parent" },
]);

export interface Relation {
  child: NodeType;
  name: RelationName;
  parent: NodeType;
}

interface AddableRelation extends Relation {
  addableFrom: RelationDirection | "both" | "neither";
}

export const getRelation = (
  parent: NodeType,
  child: NodeType,
  relationName?: RelationName,
): Relation | undefined => {
  const relation = relationName
    ? relations.find(
        (relation) =>
          relation.parent === parent && relation.child === child && relation.name === relationName,
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
 * e.g. a criterion is a detour for a solution-addresses-problem relation because if a solution fulfills
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

export const addableRelationsFrom = (nodeType: NodeType, addingAs: RelationDirection) => {
  const fromDirection = addingAs === "parent" ? "child" : "parent";

  const addableRelations = relations.filter(
    (relation) =>
      relation[fromDirection] === nodeType &&
      ["both", fromDirection].includes(relation.addableFrom),
  );

  const formattedRelations = addableRelations.map((relation) => ({
    toNodeType: relation[addingAs],
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

  const secondParentForJustification =
    justificationNodeTypes.includes(child.type) &&
    topicGraph.edges.find((edge) => edge.target === child.id);
  if (secondParentForJustification) {
    console.log(
      "cannot connect nodes: justifications are in a tree so can't have multiple parents",
    );
    return false;
  }

  if (!relation) {
    console.log("cannot connect nodes: nodes don't form a valid relation");
    return false;
  }

  return true;
};

export const parentNode = (edge: Edge, nodes: Node[]) => {
  return findNodeOrThrow(edge.source, nodes);
};

export const childNode = (edge: Edge, nodes: Node[]) => {
  return findNodeOrThrow(edge.target, nodes);
};

export const nodes = (edge: Edge, nodes: Node[]): [Node, Node] => {
  return [parentNode(edge, nodes), childNode(edge, nodes)];
};

export const getConnectingEdge = (graphPartId1: string, graphPartId2: string, edges: Edge[]) => {
  const edge = edges.find(
    (edge) =>
      (edge.source === graphPartId1 && edge.target === graphPartId2) ||
      (edge.source === graphPartId2 && edge.target === graphPartId1),
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
      (child) => child.type === shortcutRelation.detourNodeType,
    );
    const detourNodeAsParent = parentsOfChild.find(
      (parent) => parent.type === shortcutRelation.detourNodeType,
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
  // hiding nodes composed by composed nodes is really complex, let's not bother
  // TODO?: this complexity makes me think it's not worth trying to hide composed edges at all, and
  // that #434 is a better solution to the issue of showing connections when nodes are hidden
  if (edge.label === "has") return false;

  const edgeParent = parentNode(edge, topicGraph.nodes);
  const edgeChild = childNode(edge, topicGraph.nodes);

  // check implied through parent, i.e. child -[X]-> component, child -[X]-> parent, and parent -has-> component
  const componentsOfParent = components(edgeParent, topicGraph);
  const impliedThroughParentComponent = componentsOfParent.some((component) => {
    return topicGraph.edges.some(
      (otherEdge) =>
        otherEdge.source === component.id &&
        otherEdge.label === edge.label &&
        otherEdge.target === edgeChild.id,
    );
  });

  if (impliedThroughParentComponent) return true;

  // check implied through child, i.e. child -has-> component, component -[X]-> parent, child -[X]-> parent
  const componentsOfChild = components(edgeChild, topicGraph);
  const impliedThroughChildComponent = componentsOfChild.some((component) => {
    return topicGraph.edges.some(
      (otherEdge) =>
        otherEdge.target === component.id &&
        otherEdge.label === edge.label &&
        otherEdge.source === edgeParent.id,
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
export const isEdgeImplied = (edge: Edge, graph: Graph, justificationEdges: Edge[]) => {
  if (justificationRelationNames.includes(edge.label)) return false; // justifications can't be implied
  if (hasJustification(edge, justificationEdges)) return false;

  return isEdgeAShortcut(edge, graph) || isEdgeImpliedByComposition(edge, graph);
};
