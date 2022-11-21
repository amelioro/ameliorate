import { Check, Extension } from "@mui/icons-material";

import { As } from "./Diagram.store";

export interface NodeDecoration {
  themeColor: "primary" | "secondary" | "problem" | "solution"; // theme colors; is there a better way to get this?
  NodeIcon: typeof Extension;
  allowed: {
    [key in As]: NodeType[];
  };
}

export type NodeType = "Problem" | "Solution";

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
};
