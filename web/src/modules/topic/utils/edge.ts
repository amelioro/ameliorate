import { DiagramState, Node, RelationDirection } from "./diagram";
import { NodeType } from "./nodes";

export type RelationName =
  | "causes"
  | "solves"
  | "created by"
  | "criterion for"
  | "embodies"
  | "supports"
  | "critiques";

export interface Relation {
  Parent: NodeType;
  Child: NodeType;
  name: RelationName;
}

// assumes that we're always pointing from child to parent
export const relations: Relation[] = [
  { Parent: "problem", Child: "problem", name: "causes" },
  { Parent: "problem", Child: "solution", name: "solves" },

  { Parent: "solution", Child: "problem", name: "created by" },

  { Parent: "problem", Child: "criterion", name: "criterion for" },
  { Parent: "criterion", Child: "solution", name: "embodies" },

  { Parent: "rootClaim", Child: "support", name: "supports" },
  { Parent: "rootClaim", Child: "critique", name: "critiques" },

  { Parent: "support", Child: "support", name: "supports" },
  { Parent: "support", Child: "critique", name: "critiques" },

  { Parent: "critique", Child: "support", name: "supports" },
  { Parent: "critique", Child: "critique", name: "critiques" },
];

export const claimNodeTypes = ["RootClaim", "Support", "Critique"];

export const getRelation = (Parent: NodeType, Child: NodeType): Relation | undefined => {
  return relations.find((relation) => relation.Parent === Parent && relation.Child === Child);
};

type AddableNodes = {
  [key in RelationDirection]: NodeType[];
};
const addableNodesFor: Record<NodeType, AddableNodes> = {
  problem: {
    Parent: ["problem", "solution"],
    Child: ["problem", "solution", "criterion"],
  },
  solution: {
    Parent: ["problem"], // could have criteria, but need to select a specific problem for it & that requires design
    Child: ["problem"],
  },

  // can't have multiple problems;
  // could have multiple solutions but unintuitive to add from criterion because solution would be tied to parent & all sibling criteria
  criterion: { Parent: [], Child: [] },

  // claim diagram is a tree so claim nodes can't add parents
  rootClaim: { Parent: [], Child: ["support", "critique"] },
  support: { Parent: [], Child: ["support", "critique"] },
  critique: { Parent: [], Child: ["support", "critique"] },
};

export const addableRelationsFrom = (nodeType: NodeType, addingAs: RelationDirection) => {
  const fromDirection = addingAs === "Parent" ? "Child" : "Parent";
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

export const canCreateEdge = (diagram: DiagramState, parent: Node, child: Node) => {
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

  if (parent.type === "criterion" || child.type === "criterion") {
    console.log(
      "cannot connect nodes: criteria is always already connected to as many nodes as it can"
    );
    return false;
  }

  if (!relation) {
    console.log("cannot connect nodes: nodes don't form a valid relation");
    return false;
  }

  return true;
};
