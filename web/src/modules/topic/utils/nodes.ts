import { Article, Check, Extension, ThumbDown, ThumbUp } from "@mui/icons-material";

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
export type NodeType = "problem" | "solution" | "rootClaim" | "support" | "critique";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  problem: {
    themeColor: "problem",
    NodeIcon: Extension,
  },
  solution: {
    themeColor: "solution",
    NodeIcon: Check,
  },
  rootClaim: {
    themeColor: "rootClaim",
    NodeIcon: Article,
  },
  support: {
    themeColor: "support",
    NodeIcon: ThumbUp,
  },
  critique: {
    themeColor: "critique",
    NodeIcon: ThumbDown,
  },
};
