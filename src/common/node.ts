import lowerCase from "lodash/lowerCase";
import { v4 as uuid } from "uuid";
import { z } from "zod";

// Not sure how to guarantee that this matches the schema enum.
// This order is generally used for sorting, e.g.:
// - the order in which add-node buttons are displayed,
// - the order to group node types in the same layer of the diagram,
// - (future) the order to group node types in different layers of the diagram
export const nodeTypes = [
  // topic
  "problem",
  "criterion",
  "effect",
  "solutionComponent",
  "solution",

  // explore
  "question",
  "answer",
  "fact",
  "source",

  // claim
  "rootClaim",
  "support",
  "critique",

  // generic
  "custom",
] as const;

const zNodeTypes = z.enum(nodeTypes);

export type NodeType = z.infer<typeof zNodeTypes>;

export const nodeSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number(),
  arguedDiagramPartId: z.string().uuid().nullable(),
  type: zNodeTypes,
  text: z.string().max(200),
  notes: z.string().max(10000),
});

export type Node = z.infer<typeof nodeSchema>;

export const topicNodeTypes: NodeType[] = [
  "problem",
  "criterion",
  "effect",
  "solutionComponent",
  "solution",
  "custom", // is a generic node but currently only seems worthwhile in topic
];
export const exploreNodeTypes: NodeType[] = ["question", "answer", "fact", "source"];
export const claimNodeTypes: NodeType[] = ["rootClaim", "support", "critique"];

export const getNewTopicProblemNode = (topicId: number, topicTitle: string): Node => {
  return {
    id: uuid(),
    topicId,
    arguedDiagramPartId: null,
    type: "problem",
    text: lowerCase(topicTitle),
    notes: "",
  };
};
