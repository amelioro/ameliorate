import { z } from "zod";

// not sure how to guarantee that this matches the schema enum
export const nodeTypes = [
  "problem",
  "solution",
  "solutionComponent",
  "criterion",
  "effect",
  "rootClaim",
  "support",
  "critique",
] as const;

const zNodeTypes = z.enum(nodeTypes);

export type NodeType = z.infer<typeof zNodeTypes>;
