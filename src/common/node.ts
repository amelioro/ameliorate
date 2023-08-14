import { v4 as uuid } from "uuid";
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

export const nodeSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number(),
  arguedDiagramPartId: z.string().uuid().nullable(),
  type: zNodeTypes,
  text: z.string().max(200),
});

export type Node = z.infer<typeof nodeSchema>;

export const getNewTopicProblemNode = (topicId: number, topicTitle: string): Node => {
  return {
    id: uuid(),
    topicId,
    arguedDiagramPartId: null,
    type: "problem",
    text: topicTitle,
  };
};
