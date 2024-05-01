import lowerCase from "lodash/lowerCase";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { InfoCategory } from "./infoCategory";

// Not sure how to guarantee that this matches the schema enum.
// This order is generally used for sorting, e.g.:
// - the order in which add-node buttons are displayed,
// - the order to group node types in the same layer of the diagram,
// - (future) the order to group node types in different layers of the diagram
export const nodeTypes = [
  // topic
  "cause",
  "problem", // weird for problem not to be first, but subproblems should be to the right of causes for layout - maybe just make a subproblem node so this isn't awkward?
  "criterion",
  "effect",
  "benefit",
  "detriment",
  "solutionComponent",
  "solution",
  "obstacle",

  // research
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

export const zNodeTypes = z.enum(nodeTypes);

export type NodeType = z.infer<typeof zNodeTypes>;

export const nodeSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number(),
  arguedDiagramPartId: z.string().uuid().nullable(),
  type: zNodeTypes,
  customType: z
    .string()
    .max(30)
    .regex(/^[a-z ]+$/i)
    .nullable(),
  text: z.string().max(200),
  notes: z.string().max(10000),
});

export type Node = z.infer<typeof nodeSchema>;

export const infoNodeTypes: Record<InfoCategory, NodeType[]> = {
  structure: [
    "problem",
    "cause",
    "criterion",
    "effect",
    "benefit",
    "detriment",
    "solutionComponent",
    "solution",
    "obstacle",
    "custom", // is a generic node but currently only seems worthwhile in topic
  ],
  research: ["question", "answer", "fact", "source"],
  justification: ["rootClaim", "support", "critique"],
};

export const structureNodeTypes = infoNodeTypes.structure;
export const researchNodeTypes = infoNodeTypes.research;
export const justificationNodeTypes = infoNodeTypes.justification;

export const getNewTopicProblemNode = (topicId: number, topicTitle: string): Node => {
  return {
    id: uuid(),
    topicId,
    arguedDiagramPartId: null,
    type: "problem",
    customType: null,
    text: lowerCase(topicTitle),
    notes: "",
  };
};

export const getSiblingNodeTypes = (nodeType: NodeType): NodeType[] => {
  if (structureNodeTypes.includes(nodeType)) return structureNodeTypes;
  else if (researchNodeTypes.includes(nodeType)) return researchNodeTypes;
  else if (justificationNodeTypes.includes(nodeType)) return justificationNodeTypes;
  else return [];
};

export const areSiblingNodes = (node1Type: NodeType, node2Type: NodeType): boolean => {
  return getSiblingNodeTypes(node1Type).includes(node2Type);
};
