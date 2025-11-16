import { lowerCase, startCase } from "es-toolkit";

import { RelationName, justificationRelationNames } from "@/common/edge";
import { NodeType, getSameCategoryNodeTypes, nodeTypes, researchNodeTypes } from "@/common/node";
import { EffectType } from "@/web/topic/utils/effect";
import { Edge, EdgeDirection, Graph, Node, findNodeOrThrow } from "@/web/topic/utils/graph";
import { hasJustification } from "@/web/topic/utils/justification";
import { components, sourceNodes, targetNodes } from "@/web/topic/utils/node";

const questionRelations: AddableRelation[] = nodeTypes.map((nodeType) => ({
  target: "question",
  name: "asksAbout",
  source: nodeType,
  commonalityFrom: researchNodeTypes.includes(nodeType) ? { source: "common" } : {},
}));

const factRelations: AddableRelation[] = nodeTypes
  .filter((nodeType) => nodeType !== "fact" && nodeType !== "source")
  .map((nodeType) => ({
    target: "fact",
    name: "relevantFor",
    source: nodeType,
    commonalityFrom: researchNodeTypes.includes(nodeType) ? { source: "common" } : {},
  }));

const sourceRelations: AddableRelation[] = nodeTypes
  .filter((nodeType) => nodeType !== "fact" && nodeType !== "source")
  .map((nodeType) => ({
    target: "source",
    name: "relevantFor",
    source: nodeType,
    commonalityFrom: researchNodeTypes.includes(nodeType) ? { source: "common" } : {},
  }));

// prettier-ignore
const researchRelations: AddableRelation[] = questionRelations.concat(
  // ordered this way so that answer add buttons are to the right of question-add and left of fact/source-add
  [
    { target: "answer", name: "potentialAnswerTo", source: "question", commonalityFrom: { source: "common" } },
    { target: "answer", name: "accomplishes", source: "answer", commonalityFrom: { source: "common" } },
  ],
  factRelations,
  sourceRelations,
  [
    { target: "fact", name: "relatesTo", source: "fact", commonalityFrom: { target: "common" } }, // allow chaining facts, which feels natural
    { target: "source", name: "sourceOf", source: "fact", commonalityFrom: { target: "common", source: "common" } },
    { target: "source", name: "mentions", source: "source", commonalityFrom: { target: "common" } },
  ],
);

// Assumes that we're always pointing from target to source.
// This list is sorted by `source` and then `target` so that it matches the partition order of nodes
// in the layout.
// prettier-ignore
// -- allow each relation to be on one line for readability, rather than having many on one line and some and multiple lines because they're too long
const relations: AddableRelation[] = researchRelations.concat([
  // topic relations
  { target: "problem", name: "causes", source: "problem", commonalityFrom: { target: "uncommon" } },
  { target: "cause", name: "causes", source: "problem", commonalityFrom: { target: "uncommon", source: "common" } },
  { target: "problem", name: "subproblemOf", source: "problem", commonalityFrom: { source: "uncommon" } },
  { target: "benefit", name: "createdBy", source: "problem", commonalityFrom: { source: "uncommon" } },
  { target: "effect", name: "createdBy", source: "problem", commonalityFrom: { source: "uncommon" } },
  { target: "detriment", name: "createdBy", source: "problem", commonalityFrom: { source: "common" } },
  { target: "criterion", name: "criterionFor", source: "problem", commonalityFrom: { source: "uncommon" } },
  { target: "solutionComponent", name: "addresses", source: "problem", commonalityFrom: { target: "uncommon" } },
  { target: "solution", name: "addresses", source: "problem", commonalityFrom: { source: "common" } },
  { target: "solution", name: "addresses", source: "problem", commonalityFrom: { target: "uncommon" } },
  { target: "mitigationComponent", name: "addresses", source: "problem", commonalityFrom: {} },
  { target: "mitigation", name: "addresses", source: "problem", commonalityFrom: {} },

  { target: "cause", name: "causes", source: "cause", commonalityFrom: { source: "common" } },
  { target: "solutionComponent", name: "addresses", source: "cause", commonalityFrom: {} },
  { target: "solution", name: "addresses", source: "cause", commonalityFrom: { source: "common" } },
  { target: "mitigationComponent", name: "addresses", source: "cause", commonalityFrom: {} },
  { target: "mitigation", name: "addresses", source: "cause", commonalityFrom: {} },

  { target: "criterion", name: "relatesTo", source: "benefit", commonalityFrom: {} },
  { target: "criterion", name: "relatesTo", source: "effect", commonalityFrom: {} },
  { target: "criterion", name: "relatesTo", source: "detriment", commonalityFrom: {} },

  // These relations above `creates` relations so that new edges result in these over `creates`
  // by default; usually `creates` edges will be the result of an add node button, not a drag-and-drop edge.
  // This issue would probably be better solved by distinguishing problem effects vs solution effects,
  // because solution-problem relations would be addresses, and solution-solution/problem-problem
  // would be creates/createdBy. But that's a bigger change to make.
  { target: "detriment", name: "causes", source: "cause", commonalityFrom: {} },
  { target: "detriment", name: "causes", source: "detriment", commonalityFrom: {} },
  { target: "benefit", name: "addresses", source: "cause", commonalityFrom: {} },
  { target: "benefit", name: "addresses", source: "detriment", commonalityFrom: {} },

  // effects, benefits, detriments, can each create each other (when coming up from solution)
  // and be created by each other (when going up to problem)
  { target: "benefit", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "effect", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "detriment", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "benefit", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } }, // regular effects are generally uncommon - usually it feels like we think in terms of good or bad effects
  { target: "effect", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } },
  { target: "detriment", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } },
  { target: "benefit", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },
  { target: "effect", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },
  { target: "detriment", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },
  { target: "benefit", name: "createdBy", source: "benefit", commonalityFrom: { source: "common" } },
  { target: "effect", name: "createdBy", source: "benefit", commonalityFrom: { source: "uncommon" } },
  { target: "detriment", name: "createdBy", source: "benefit", commonalityFrom: { source: "common" } },
  { target: "benefit", name: "createdBy", source: "effect", commonalityFrom: { source: "common" } },
  { target: "effect", name: "createdBy", source: "effect", commonalityFrom: { source: "uncommon" } },
  { target: "detriment", name: "createdBy", source: "effect", commonalityFrom: { source: "common" } },
  { target: "benefit", name: "createdBy", source: "detriment", commonalityFrom: { source: "common" } },
  { target: "effect", name: "createdBy", source: "detriment", commonalityFrom: { source: "uncommon" } },
  { target: "detriment", name: "createdBy", source: "detriment", commonalityFrom: { source: "common" } },

  // below effect-create-effect relations so that Add Solution button is to the right of Add Effect button for Detriment, because effects are expected to be more commonly added than solutions
  { target: "solutionComponent", name: "addresses", source: "detriment", commonalityFrom: {} },
  { target: "solution", name: "addresses", source: "detriment", commonalityFrom: { source: "common" } },
  { target: "mitigationComponent", name: "mitigates", source: "detriment", commonalityFrom: {} },
  { target: "mitigation", name: "mitigates", source: "detriment", commonalityFrom: {} }, // there's a hack to make this relation addable instead of solution for solution detriments

  { target: "benefit", name: "fulfills", source: "criterion", commonalityFrom: {} },
  { target: "effect", name: "fulfills", source: "criterion", commonalityFrom: {} },
  { target: "detriment", name: "relatesTo", source: "criterion", commonalityFrom: {} },
  { target: "solutionComponent", name: "fulfills", source: "criterion", commonalityFrom: {} },
  { target: "solution", name: "fulfills", source: "criterion", commonalityFrom: {} },
  { target: "mitigationComponent", name: "fulfills", source: "criterion", commonalityFrom: {} },
  { target: "mitigation", name: "fulfills", source: "criterion", commonalityFrom: {} },

  { target: "solutionComponent", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "solution", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "solutionComponent", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } },
  { target: "solution", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } },
  { target: "solutionComponent", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },
  { target: "solution", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },
  { target: "mitigationComponent", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "mitigation", name: "creates", source: "benefit", commonalityFrom: { target: "common" } },
  { target: "mitigationComponent", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } },
  { target: "mitigation", name: "creates", source: "effect", commonalityFrom: { target: "uncommon" } },
  { target: "mitigationComponent", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },
  { target: "mitigation", name: "creates", source: "detriment", commonalityFrom: { target: "common" } },

  { target: "solutionComponent", name: "has", source: "solutionComponent", commonalityFrom: { target: "common" } },
  { target: "solution", name: "has", source: "solutionComponent", commonalityFrom: { target: "common" } },
  { target: "mitigationComponent", name: "has", source: "mitigationComponent", commonalityFrom: { target: "common" } },
  { target: "mitigation", name: "has", source: "mitigationComponent", commonalityFrom: { target: "common" }},

  { target: "obstacle", name: "obstacleOf", source: "solutionComponent", commonalityFrom: { source: "uncommon" } },
  { target: "obstacle", name: "obstacleOf", source: "solution", commonalityFrom: { source: "uncommon" } },
  { target: "obstacle", name: "obstacleOf", source: "mitigationComponent", commonalityFrom: { source: "uncommon" } },
  { target: "obstacle", name: "obstacleOf", source: "mitigation", commonalityFrom: { source: "uncommon" } },

  { target: "solutionComponent", name: "addresses", source: "obstacle", commonalityFrom: {} },
  { target: "solution", name: "addresses", source: "obstacle", commonalityFrom: {} },
  { target: "mitigationComponent", name: "mitigates", source: "obstacle", commonalityFrom: {} },
  { target: "mitigation", name: "mitigates", source: "obstacle", commonalityFrom: { source: "common" } },

  { target: "solution", name: "accomplishes", source: "solution", commonalityFrom: { source: "uncommon" } },
  { target: "solution", name: "contingencyFor", source: "solution", commonalityFrom: {} },

  // justification relations
  { target: "support", name: "supports", source: "rootClaim", commonalityFrom: { source: "common" } },
  { target: "critique", name: "critiques", source: "rootClaim", commonalityFrom: { source: "common" } },

  { target: "support", name: "supports", source: "support", commonalityFrom: { source: "common" } },
  { target: "critique", name: "critiques", source: "support", commonalityFrom: { source: "common" } },

  { target: "support", name: "supports", source: "critique", commonalityFrom: { source: "common" } },
  { target: "critique", name: "critiques", source: "critique", commonalityFrom: { source: "common" } },
]);

export interface Relation {
  target: NodeType;
  name: RelationName;
  source: NodeType;
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
  const from: EdgeDirection = relation.as === "source" ? "target" : "source";

  return from === "target"
    ? `this ${startCase(relation.target)} '${lowerCase(relation.name)}'` // e.g. this Problem causes
    : `'${lowerCase(relation.name)}' this ${startCase(relation.source)}`; // e.g. causes this Problem
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
  target: NodeType,
  relationName: RelationName | undefined,
  source: NodeType,
): Relation => {
  const relation = relationName
    ? relations.find(
        (relation) =>
          relation.source === source &&
          relation.target === target &&
          relation.name === relationName,
      )
    : relations.find((relation) => relation.source === source && relation.target === target);

  // we're assuming that anything can relate to anything else; potentially this should only be true when unrestricted editing is on
  return relation ?? { target, name: "relatesTo", source };
};

export const composedRelations: Relation[] = [
  { target: "solution", name: "has", source: "solutionComponent" },
];

export const componentTypes = composedRelations.map((relation) => relation.source);

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
    relation: { target: "solution", name: "addresses", source: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { target: "solutionComponent", name: "addresses", source: "problem" },
  },
  {
    detourNodeType: "criterion",
    relation: { target: "effect", name: "addresses", source: "problem" },
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
): DirectedToRelationWithCommonality[] => {
  if (addingAs === undefined) {
    return addableRelationsFrom(fromNodeType, "target", unrestrictedAddingFrom, effectType).concat(
      addableRelationsFrom(fromNodeType, "source", unrestrictedAddingFrom, effectType),
    );
  }

  const fromDirection = addingAs === "source" ? "target" : "source";
  const toDirection = addingAs;

  const addableRelations: RelationWithCommonality[] = getSameCategoryNodeTypes(fromNodeType)
    .map((toNodeType) => {
      // hack to ensure that problem detriments can't be mitigated (and can be solved), and solution detriments can be mitigated (but not solved);
      // this is really awkward but keeps detriment nodes from being able to have both solutions and mitigations added, which could be really confusing for users
      // note1: also not doing this when we're unrestricted, since that should result in being able to add both mitigations and solutions in both cases anyway.
      // note2: maybe ideal to have different node types for problemDetriment vs solutionDetriment? then these could just have their own addableFrom relations.
      if (
        fromNodeType === "detriment" &&
        effectType === "solution" &&
        addingAs === "target" &&
        toNodeType === "solution" &&
        !unrestrictedAddingFrom
      ) {
        return {
          target: "mitigation",
          name: "mitigates",
          source: fromNodeType,
          commonality: "uncommon",
        } satisfies RelationWithCommonality;
      }

      // use an addableFrom relation if it exists, prioritizing commonality to grab common relations before uncommon ones
      const addableRelationsFrom = relations
        .filter(
          (relation) =>
            relation[fromDirection] === fromNodeType &&
            relation[toDirection] === toNodeType &&
            (effectType !== "solution" || relation.name !== "createdBy") && // hack to not grab "createdBy" relations for solution effects, because these should be using "creates"
            (effectType !== "problem" || relation.name !== "creates"), // hack to not grab "creates" relations for problem effects, because these should be using "createdBy"
        )
        .map(
          (relation) =>
            ({
              target: relation.target,
              name: relation.name,
              source: relation.source,
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
            ? getRelation(toNodeType, undefined, fromNodeType)
            : getRelation(fromNodeType, undefined, toNodeType);
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

export const canCreateEdge = (topicGraph: Graph, target: Node, source: Node) => {
  const existingEdge = topicGraph.edges.find((edge) => {
    return (
      (edge.source === source.id && edge.target === target.id) ||
      (edge.source === target.id && edge.target === source.id)
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

  // check implied through source, i.e. target -[X]-> component, target -[X]-> source, and source -has-> component
  const componentsOfSource = components(edgeSource, topicGraph);
  const impliedThroughSourceComponent = componentsOfSource.some((component) => {
    return topicGraph.edges.some(
      (otherEdge) =>
        otherEdge.source === component.id &&
        otherEdge.label === edge.label &&
        otherEdge.target === edgeTarget.id,
    );
  });

  if (impliedThroughSourceComponent) return true;

  // check implied through target, i.e. target -has-> component, component -[X]-> source, target -[X]-> source
  const componentsOfTarget = components(edgeTarget, topicGraph);
  const impliedThroughTargetComponent = componentsOfTarget.some((component) => {
    return topicGraph.edges.some(
      (otherEdge) =>
        otherEdge.target === component.id &&
        otherEdge.label === edge.label &&
        otherEdge.source === edgeSource.id,
    );
  });

  return impliedThroughTargetComponent;
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
