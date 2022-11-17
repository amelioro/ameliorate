import { Check, Extension } from "@mui/icons-material";

export interface NodeDecoration {
  themeColor: "primary" | "secondary" | "problem" | "solution"; // theme colors; is there a better way to get this?
  NodeIcon: typeof Extension;
}

export type NodeType = "Problem" | "Solution";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  Problem: {
    themeColor: "problem",
    NodeIcon: Extension,
  },
  Solution: {
    themeColor: "solution",
    NodeIcon: Check,
  },
};
