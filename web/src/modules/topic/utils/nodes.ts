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
