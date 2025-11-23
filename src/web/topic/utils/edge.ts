import { lowerCase, startCase } from "es-toolkit";

import { RelationName, justificationRelationNames } from "@/common/edge";
import { NodeType, getSameCategoryNodeTypes, nodeTypes, researchNodeTypes } from "@/common/node";
import { type EffectType } from "@/web/topic/utils/effect";
import { Edge, EdgeDirection, Graph, Node, findNodeOrThrow } from "@/web/topic/utils/graph";
import { hasJustification } from "@/web/topic/utils/justification";
import { components, sourceNodes, targetNodes } from "@/web/topic/utils/node";

const questionRelations: AddableRelation[] = nodeTypes.map((nodeType) => ({
  source: "question",
  name: "asksAbout",
  target: nodeType,
  commonalityFrom: researchNodeTypes.includes(nodeType) ? { target: "common" } : {},
}));

const factRelations: AddableRelation[] = nodeTypes
  .filter((nodeType) => nodeType !== "fact" && nodeType !== "source")
  .map((nodeType) => ({
    source: "fact",
    name: "relevantFor",
    target: nodeType,
    commonalityFrom: researchNodeTypes.includes(nodeType) ? { target: "common" } : {},
  }));

const sourceRelations: AddableRelation[] = nodeTypes
  .filter((nodeType) => nodeType !== "fact" && nodeType !== "source")
  .map((nodeType) => ({
    source: "source",
    name: "relevantFor",
    target: nodeType,
    commonalityFrom: researchNodeTypes.includes(nodeType) ? { target: "common" } : {},
  }));

// prettier-ignore
const researchRelations: AddableRelation[] = questionRelations.concat(
  // ordered this way so that answer add buttons are to the right of question-add and left of fact/source-add
  [
    { source: "answer", name: "potentialAnswerTo", target: "question", commonalityFrom: { target: "common" } },
    { source: "answer", name: "accomplishes", target: "answer", commonalityFrom: { target: "common" } },
  ],
  factRelations,
  sourceRelations,
  [
    { source: "fact", name: "relatesTo", target: "fact", commonalityFrom: { source: "common" } }, // allow chaining facts, which feels natural
    { source: "source", name: "sourceOf", target: "fact", commonalityFrom: { source: "common", target: "common" } },
    { source: "source", name: "mentions", target: "source", commonalityFrom: { source: "common" } },
  ],
);

// Assumes that we're always pointing from source to target.
// This list is sorted by `target` and then `source` so that it matches the partition order of nodes
// in the layout.
// prettier-ignore
// -- allow each relation to be on one line for readability, rather than having many on one line and some and multiple lines because they're too long
const relations: AddableRelation[] = researchRelations.concat([
  // topic relations
  { source: "problem", name: "causes", target: "problem", commonalityFrom: { source: "uncommon" } },
  { source: "cause", name: "causes", target: "problem", commonalityFrom: { source: "uncommon", target: "common" } },
  { source: "problem", name: "has", target: "problem", commonalityFrom: { source: "uncommon" } },
  { source: "criterion", name: "criterionFor", target: "problem", commonalityFrom: { target: "uncommon" } },
  { source: "solutionComponent", name: "addresses", target: "problem", commonalityFrom: { source: "uncommon" } },
  { source: "solution", name: "addresses", target: "problem", commonalityFrom: { target: "common" } },
  { source: "solution", name: "addresses", target: "problem", commonalityFrom: { source: "uncommon" } },
  { source: "mitigationComponent", name: "addresses", target: "problem", commonalityFrom: {} },
  { source: "mitigation", name: "addresses", target: "problem", commonalityFrom: {} },

  { source: "cause", name: "causes", target: "cause", commonalityFrom: { target: "common" } },
  { source: "solutionComponent", name: "addresses", target: "cause", commonalityFrom: {} },
  { source: "solution", name: "addresses", target: "cause", commonalityFrom: { target: "common" } },
  { source: "mitigationComponent", name: "addresses", target: "cause", commonalityFrom: {} },
  { source: "mitigation", name: "addresses", target: "cause", commonalityFrom: {} },

  { source: "criterion", name: "relatesTo", target: "benefit", commonalityFrom: {} },
  { source: "criterion", name: "relatesTo", target: "effect", commonalityFrom: {} },
  { source: "criterion", name: "relatesTo", target: "detriment", commonalityFrom: {} },

  // These relations above effect `causes` relations so that new edges result in these over `causes`
  // by default; usually effect `causes` edges will be the result of an add node button, not a drag-and-drop edge.
  // This issue would probably be better solved by distinguishing problem effects vs solution effects,
  // because solution-problem relations would be addresses, and solution-solution/problem-problem
  // would be causes. But that's a bigger change to make.
  { source: "detriment", name: "causes", target: "cause", commonalityFrom: {} },
  { source: "benefit", name: "addresses", target: "cause", commonalityFrom: {} },
  { source: "benefit", name: "addresses", target: "detriment", commonalityFrom: {} },

  // effects, benefits, detriments, can each cause each other
  // note: for addable above/below, commonality is overridden elsewhere based on if it's from a problem/solution effect
  { source: "benefit", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "effect", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "detriment", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "benefit", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } }, // regular effects are generally uncommon - usually it feels like we think in terms of good or bad effects
  { source: "effect", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "detriment", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "benefit", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },
  { source: "effect", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },
  { source: "detriment", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },

  // below effect-create-effect relations so that Add Solution button is to the right of Add Effect button for Detriment, because effects are expected to be more commonly added than solutions
  { source: "solutionComponent", name: "addresses", target: "detriment", commonalityFrom: {} },
  { source: "solution", name: "addresses", target: "detriment", commonalityFrom: { target: "common" } },
  { source: "mitigationComponent", name: "mitigates", target: "detriment", commonalityFrom: {} },
  { source: "mitigation", name: "mitigates", target: "detriment", commonalityFrom: {} }, // there's a hack to make this relation addable instead of solution for solution detriments

  { source: "benefit", name: "fulfills", target: "criterion", commonalityFrom: {} },
  { source: "effect", name: "fulfills", target: "criterion", commonalityFrom: {} },
  { source: "detriment", name: "relatesTo", target: "criterion", commonalityFrom: {} },
  { source: "solutionComponent", name: "fulfills", target: "criterion", commonalityFrom: {} },
  { source: "solution", name: "fulfills", target: "criterion", commonalityFrom: {} },
  { source: "mitigationComponent", name: "fulfills", target: "criterion", commonalityFrom: {} },
  { source: "mitigation", name: "fulfills", target: "criterion", commonalityFrom: {} },

  { source: "problem", name: "causes", target: "benefit", commonalityFrom: { source: "uncommon" } },
  { source: "problem", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "problem", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },
  { source: "solutionComponent", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "solution", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "solutionComponent", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "solution", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "solutionComponent", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },
  { source: "solution", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },
  { source: "mitigationComponent", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "mitigation", name: "causes", target: "benefit", commonalityFrom: { source: "common" } },
  { source: "mitigationComponent", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "mitigation", name: "causes", target: "effect", commonalityFrom: { source: "uncommon" } },
  { source: "mitigationComponent", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },
  { source: "mitigation", name: "causes", target: "detriment", commonalityFrom: { source: "common" } },

  { source: "solutionComponent", name: "has", target: "solutionComponent", commonalityFrom: { source: "common" } },
  { source: "solution", name: "has", target: "solutionComponent", commonalityFrom: { source: "common" } },
  { source: "mitigationComponent", name: "has", target: "mitigationComponent", commonalityFrom: { source: "common" } },
  { source: "mitigation", name: "has", target: "mitigationComponent", commonalityFrom: { source: "common" }},

  { source: "obstacle", name: "impedes", target: "solutionComponent", commonalityFrom: { target: "uncommon" } },
  { source: "obstacle", name: "impedes", target: "solution", commonalityFrom: { target: "uncommon" } },
  { source: "obstacle", name: "impedes", target: "mitigationComponent", commonalityFrom: { target: "uncommon" } },
  { source: "obstacle", name: "impedes", target: "mitigation", commonalityFrom: { target: "uncommon" } },

  { source: "solutionComponent", name: "addresses", target: "obstacle", commonalityFrom: {} },
  { source: "solution", name: "addresses", target: "obstacle", commonalityFrom: {} },
  { source: "mitigationComponent", name: "mitigates", target: "obstacle", commonalityFrom: {} },
  { source: "mitigation", name: "mitigates", target: "obstacle", commonalityFrom: { target: "common" } },

  { source: "solution", name: "accomplishes", target: "solution", commonalityFrom: { target: "uncommon" } },
  { source: "solution", name: "contingencyFor", target: "solution", commonalityFrom: {} },

  // justification relations
  { source: "support", name: "supports", target: "rootClaim", commonalityFrom: { target: "common" } },
  { source: "critique", name: "critiques", target: "rootClaim", commonalityFrom: { target: "common" } },

  { source: "support", name: "supports", target: "support", commonalityFrom: { target: "common" } },
  { source: "critique", name: "critiques", target: "support", commonalityFrom: { target: "common" } },

  { source: "support", name: "supports", target: "critique", commonalityFrom: { target: "common" } },
  { source: "critique", name: "critiques", target: "critique", commonalityFrom: { target: "common" } },
]);

export interface Relation {
  source: NodeType;
  name: RelationName;
  target: NodeType;
}

/**
 * For searching for relations or nodes, e.g. finding nodes in a summary column, or finding which
 * addable relations should be used for the add node button's search box.
 *
 * Motivated to make this so that these two examples (summary column nodes and summary column's add
 * button's search box nodes) can be built from this one data structure and kept consistent with
 * each other.
 */
export interface DirectedSearchRelation {
  toDirection: EdgeDirection;
  relationNames: RelationName[];
  /**
   * undefined means not to restrict based on node type, e.g. for getting addressed nodes, we don't
   * care what kind of node is being addressed as long as there is/can-be an "addresses" edge.
   */
  toNodeTypes?: NodeType[];
}

export const filterAddablesViaSearchRelations = (
  defaultAddableRelations: DirectedToRelationWithCommonality[],
  directedSearchRelations: DirectedSearchRelation[],
): DirectedToRelationWithCommonality[] => {
  return defaultAddableRelations.filter((addableRelation) => {
    return directedSearchRelations.some((searchRelation) => {
      return (
        searchRelation.relationNames.includes(addableRelation.name) &&
        searchRelation.toDirection === addableRelation.as &&
        (searchRelation.toNodeTypes ?? nodeTypes).includes(addableRelation[addableRelation.as])
      );
    });
  });
};

export interface DirectedToRelation extends Relation {
  /**
   * "as" because `DirectionTo` is usually used in the case of adding nodes, "as" source or target
   */
  as: EdgeDirection;
}

/**
 * Not the best name, but in some spots we care about direction and not about commonality, so we
 * should have separate types for these separate situations.
 */
export interface DirectedToRelationWithCommonality extends DirectedToRelation {
  commonality: Commonality;
}

export const getDirectedRelationDescription = (relation: DirectedToRelation): string => {
  const from: EdgeDirection = relation.as === "target" ? "source" : "target";

  return from === "source"
    ? `this ${startCase(relation.source)} '${lowerCase(relation.name)}'` // e.g. this Problem causes
    : `'${lowerCase(relation.name)}' this ${startCase(relation.target)}`; // e.g. causes this Problem
};

/**
 * Used so that common relations can be given UI priority, e.g. common relations can be higher in a
 * list of relations to add to a node.
 *
 * Unspecified is assumed to be `onlyForConnections`.
 *
 * `onlyForConnections` means the relation shouldn't show when adding new nodes, but should be kept
 * as a relation to add when connecting existing nodes.
 */
type Commonality = "common" | "uncommon" | "onlyForConnections";

interface AddableRelation extends Relation {
  commonalityFrom: {
    [key in EdgeDirection]?: Commonality;
  };
}

export const getRelation = (
  source: NodeType,
  relationName: RelationName | undefined,
  target: NodeType,
): Relation => {
  const relation = relationName
    ? relations.find(
        (relation) =>
          relation.source === source &&
          relation.name === relationName &&
          relation.target === target,
      )
    : relations.find((relation) => relation.source === source && relation.target === target);

  // we're assuming that anything can relate to anything else; potentially this should only be true when unrestricted editing is on
  return relation ?? { source, name: "relatesTo", target };
};

export const composedRelations: Relation[] = [
  { source: "solution", name: "has", target: "solutionComponent" },
];

export const componentTypes = composedRelations.map((relation) => relation.target);

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
    relation: { source: "solution", name: "addresses", target: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { source: "solutionComponent", name: "addresses", target: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { source: "effect", name: "addresses", target: "problem" },
  },
];

const compareCommonality = (
  relation1: RelationWithCommonality,
  relation2: RelationWithCommonality,
) => {
  const commonality1 = relation1.commonality;
  const commonality2 = relation2.commonality;

  if (commonality1 === commonality2) {
    return 0;
  }

  if (
    commonality1 === "common" ||
    (commonality1 === "uncommon" && commonality2 === "onlyForConnections")
  ) {
    return -1;
  }

  return 1;
};

type RelationWithCommonality = Relation & { commonality: Commonality };

export const addableRelationsFrom = (
  fromNodeType: NodeType,
  addingAs: EdgeDirection | undefined,
  unrestrictedAddingFrom: boolean,
  effectType: EffectType,
  sameCategoryNodeTypes = true,
): DirectedToRelationWithCommonality[] => {
  if (addingAs === undefined) {
    return addableRelationsFrom(
      fromNodeType,
      "source",
      unrestrictedAddingFrom,
      effectType,
      sameCategoryNodeTypes,
    ).concat(
      addableRelationsFrom(
        fromNodeType,
        "target",
        unrestrictedAddingFrom,
        effectType,
        sameCategoryNodeTypes,
      ),
    );
  }

  const fromDirection = addingAs === "source" ? "target" : "source";
  const toDirection = addingAs;

  const nodeTypesToCheckRelations = sameCategoryNodeTypes
    ? getSameCategoryNodeTypes(fromNodeType)
    : nodeTypes;

  const addableRelations: RelationWithCommonality[] = nodeTypesToCheckRelations
    .map((toNodeType) => {
      // hack to ensure that problem detriments can't be mitigated (and can be solved), and solution detriments can be mitigated (but not solved);
      // this is really awkward but keeps detriment nodes from being able to have both solutions and mitigations added, which could be really confusing for users
      // note1: also not doing this when we're unrestricted, since that should result in being able to add both mitigations and solutions in both cases anyway.
      // note2: maybe ideal to have different node types for problemDetriment vs solutionDetriment? then these could just have their own addableFrom relations.
      if (
        fromNodeType === "detriment" &&
        effectType === "solution" &&
        addingAs === "source" &&
        toNodeType === "solution" &&
        !unrestrictedAddingFrom
      ) {
        return {
          source: "mitigation",
          name: "mitigates",
          target: fromNodeType,
          commonality: "uncommon",
        } satisfies RelationWithCommonality;
      }

      // use an addableFrom relation if it exists, prioritizing commonality to grab common relations before uncommon ones
      const addableRelationsFrom = relations
        .filter(
          (relation) =>
            relation[fromDirection] === fromNodeType && relation[toDirection] === toNodeType,
        )
        .map(
          (relation) =>
            ({
              source: relation.source,
              name: relation.name,
              target: relation.target,
              commonality: relation.commonalityFrom[fromDirection] ?? "onlyForConnections",
            }) satisfies RelationWithCommonality,
        )
        .toSorted(compareCommonality);

      const mostCommonAddable = addableRelationsFrom[0];
      if (mostCommonAddable) {
        if (unrestrictedAddingFrom) {
          // if we're unrestricted-adding, only take a common relation because we want to show all add buttons (only common relations will have add buttons, and if there isn't one here, we'll find one with the main unrestricted logic below)
          if (mostCommonAddable.commonality === "common") return mostCommonAddable;
        } else {
          return mostCommonAddable;
        }
      }

      // otherwise, if unrestricted, allow adding any same-category node as source or target
      if (unrestrictedAddingFrom) {
        const unrestrictedRelation =
          fromDirection === "source"
            ? getRelation(fromNodeType, undefined, toNodeType)
            : getRelation(toNodeType, undefined, fromNodeType);
        return { ...unrestrictedRelation, commonality: "common" } satisfies RelationWithCommonality;
      }

      // otherwise we have no addable relation from/to these node types
      return null;
    })
    .filter((relation) => relation !== null);

  const formattedRelations = addableRelations.map((relation) => ({
    ...relation,
    as: addingAs,
  }));

  return formattedRelations;
};

export const canCreateEdge = (topicGraph: Graph, source: Node, target: Node) => {
  const existingEdge = topicGraph.edges.find((edge) => {
    return (
      (edge.source === target.id && edge.target === source.id) ||
      (edge.source === source.id && edge.target === target.id)
    );
  });

  if (source.id === target.id) {
    console.log("cannot connect nodes: tried dragging node onto itself");
    return false;
  }

  if (existingEdge) {
    console.log("cannot connect nodes: tried dragging between already-connected nodes");
    return false;
  }

  return true;
};

export const sourceNode = (edge: Edge, nodes: Node[]) => {
  return findNodeOrThrow(edge.source, nodes);
};

export const targetNode = (edge: Edge, nodes: Node[]) => {
  return findNodeOrThrow(edge.target, nodes);
};

export const nodes = (edge: Edge, nodes: Node[]): [Node, Node] => {
  return [sourceNode(edge, nodes), targetNode(edge, nodes)];
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
  const edgeSource = sourceNode(edge, topicGraph.nodes);
  const edgeTarget = targetNode(edge, topicGraph.nodes);

  return shortcutRelations.some((shortcutRelation) => {
    const edgeCouldBeAShortcut =
      edgeSource.type === shortcutRelation.relation.source &&
      edgeTarget.type === shortcutRelation.relation.target;

    if (!edgeCouldBeAShortcut) return false;

    const targetsOfSource = targetNodes(edgeSource, topicGraph);
    const sourcesOfTarget = sourceNodes(edgeTarget, topicGraph);

    const detourNodeAsTarget = targetsOfSource.find(
      (target) => target.type === shortcutRelation.detourNodeType,
    );
    const detourNodeAsSource = sourcesOfTarget.find(
      (source) => source.type === shortcutRelation.detourNodeType,
    );

    // note: does not check if detour node is showing - this is so that hidden shortcut edges
    // can still be shown when a detour node is hidden
    const detourNodeConnectsSourceAndTarget = detourNodeAsTarget && detourNodeAsSource;

    return detourNodeConnectsSourceAndTarget;
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

  const edgeSource = sourceNode(edge, topicGraph.nodes);
  const edgeTarget = targetNode(edge, topicGraph.nodes);

  // check implied through target, i.e. source -[X]-> component, source -[X]-> target, and target -has-> component
  const componentsOfTarget = components(edgeTarget, topicGraph);
  const impliedThroughTargetComponent = componentsOfTarget.some((component) => {
    return topicGraph.edges.some(
      (otherEdge) =>
        otherEdge.target === component.id &&
        otherEdge.label === edge.label &&
        otherEdge.source === edgeSource.id,
    );
  });

  if (impliedThroughTargetComponent) return true;

  // check implied through source, i.e. source -has-> component, component -[X]-> target, source -[X]-> target
  const componentsOfSource = components(edgeSource, topicGraph);
  const impliedThroughSourceComponent = componentsOfSource.some((component) => {
    return topicGraph.edges.some(
      (otherEdge) =>
        otherEdge.source === component.id &&
        otherEdge.label === edge.label &&
        otherEdge.target === edgeTarget.id,
    );
  });

  return impliedThroughSourceComponent;
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
