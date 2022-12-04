import { Article, Check, Extension, ThumbDown, ThumbUp } from "@mui/icons-material";

import { NodeRelation } from "../utils/diagram";

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
  allowed: {
    [key in NodeRelation]: NodeType[];
  };
}

// TODO(refactor): should only need to edit this file to add new node types
export type NodeType = "Problem" | "Solution" | "RootClaim" | "Support" | "Critique";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  Problem: {
    themeColor: "problem",
    NodeIcon: Extension,
    allowed: {
      Parent: ["Problem", "Solution"],
      Child: ["Problem", "Solution"],
    },
  },
  Solution: {
    themeColor: "solution",
    NodeIcon: Check,
    allowed: {
      Parent: ["Problem", "Solution"],
      Child: ["Problem", "Solution"],
    },
  },
  RootClaim: {
    themeColor: "rootClaim",
    NodeIcon: Article,
    allowed: {
      Parent: [],
      Child: ["Support", "Critique"],
    },
  },
  Support: {
    themeColor: "support",
    NodeIcon: ThumbUp,
    allowed: {
      Parent: [],
      Child: ["Support", "Critique"],
    },
  },
  Critique: {
    themeColor: "critique",
    NodeIcon: ThumbDown,
    allowed: {
      Parent: [],
      Child: ["Support", "Critique"],
    },
  },
};
