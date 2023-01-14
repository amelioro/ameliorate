import { Article, Check, Extension, ThumbDown, ThumbUp } from "@mui/icons-material";

export const maxCharsPerLine = 19; // measured by typing "a"'s in a node textbox

export interface NodeDecoration {
  NodeIcon: typeof Extension;
}

export type NodeType = "problem" | "solution" | "rootClaim" | "support" | "critique";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  problem: {
    NodeIcon: Extension,
  },
  solution: {
    NodeIcon: Check,
  },
  rootClaim: {
    NodeIcon: Article,
  },
  support: {
    NodeIcon: ThumbUp,
  },
  critique: {
    NodeIcon: ThumbDown,
  },
};
