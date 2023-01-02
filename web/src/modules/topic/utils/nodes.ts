import { Article, Check, Extension, ThumbDown, ThumbUp } from "@mui/icons-material";

import { RelationDirection } from "./diagram";

export const maxCharsPerLine = 19; // measured by typing "a"'s in a node textbox

export interface NodeDecoration {
  themeColor:
    | "primary"
    | "secondary"
    | "problem"
    | "solution"
    | "rootClaim"
    | "support"
    | "critique"; // theme colors; is there a better way to get this?
  NodeIcon: typeof Extension;
}

// TODO(refactor): should only need to edit this file to add new node types
export type NodeType = "Problem" | "Solution" | "RootClaim" | "Support" | "Critique";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  Problem: {
    themeColor: "problem",
    NodeIcon: Extension,
  },
  Solution: {
    themeColor: "solution",
    NodeIcon: Check,
  },
  RootClaim: {
    themeColor: "rootClaim",
    NodeIcon: Article,
  },
  Support: {
    themeColor: "support",
    NodeIcon: ThumbUp,
  },
  Critique: {
    themeColor: "critique",
    NodeIcon: ThumbDown,
  },
};

export type RelationName = "causes" | "solves" | "created by" | "supports" | "critiques";

export interface Relation {
  Parent: NodeType;
  Child: NodeType;
  name: RelationName;
}

// assumes that we're always pointing from child to parent
export const relations: Relation[] = [
  { Parent: "Problem", Child: "Problem", name: "causes" },
  { Parent: "Problem", Child: "Solution", name: "solves" },

  { Parent: "Solution", Child: "Problem", name: "created by" },

  { Parent: "RootClaim", Child: "Support", name: "supports" },
  { Parent: "RootClaim", Child: "Critique", name: "critiques" },

  { Parent: "Support", Child: "Support", name: "supports" },
  { Parent: "Support", Child: "Critique", name: "critiques" },

  { Parent: "Critique", Child: "Support", name: "supports" },
  { Parent: "Critique", Child: "Critique", name: "critiques" },
];

export const claimNodeTypes = ["RootClaim", "Support", "Critique"];

export const getRelation = (Parent: NodeType, Child: NodeType): Relation | undefined => {
  return relations.find((relation) => relation.Parent === Parent && relation.Child === Child);
};

export const addableRelationsFrom = (nodeType: NodeType, addingAs: RelationDirection) => {
  // claim diagram is a tree so claim nodes can't add parents
  if (claimNodeTypes.includes(nodeType) && addingAs === "Parent") return [];

  const fromDirection = addingAs === "Parent" ? "Child" : "Parent";
  const addableRelations = relations.filter((relation) => relation[fromDirection] === nodeType);

  const formattedRelations = addableRelations.map((relation) => ({
    toNodeType: relation[addingAs],
    relation: relation.name,
  }));

  return formattedRelations;
};
