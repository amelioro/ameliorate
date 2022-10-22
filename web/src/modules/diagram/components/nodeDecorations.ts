export interface NodeDecoration {
  themeColor: "primary" | "secondary" | "problem" | "solution"; // theme colors; is there a better way to get this?
  iconSrc: string;
}

export type NodeType = "Problem" | "Solution";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  Problem: {
    themeColor: "problem",
    iconSrc: "/puzzle.png",
  },
  Solution: {
    themeColor: "solution",
    iconSrc: "/check.svg",
  },
};
