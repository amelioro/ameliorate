import { lowerCase } from "es-toolkit";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { InfoCategory } from "@/common/infoCategory";

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
  "solutionComponent",
  "benefit",
  "effect",
  "detriment",
  "solution",
  "obstacle",
  "mitigationComponent",
  // Technically solution can act as a mitigation, but a separate node type enables us to treat
  // mitigations as lesser, not-core nodes like solutions.
  // Will have to keep an eye out for if this seems worth the separate node type, or if it creates
  // too much confusion.
  "mitigation",

  // research
  "question",
  "answer",
  "fact",
  "source",

  // justification
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
    .regex(/^[a-z ]+$/i, "customType should only contain letters and spaces.")
    .nullable(),
  text: z.string().max(200),
  notes: z.string().max(10000),
});

export type Node = z.infer<typeof nodeSchema>;

export const infoNodeTypes: Record<InfoCategory, NodeType[]> = {
  breakdown: [
    "cause",
    "problem",
    "criterion",
    "solutionComponent",
    "benefit",
    "effect",
    "detriment",
    "solution",
    "obstacle",
    "mitigationComponent",
    "mitigation",
    "custom", // is a generic node but currently only seems worthwhile in topic
  ],
  research: ["question", "answer", "fact", "source"],
  justification: ["rootClaim", "support", "critique"],
};

export const breakdownNodeTypes = infoNodeTypes.breakdown;
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

export const getSameCategoryNodeTypes = (nodeType: NodeType): NodeType[] => {
  if (breakdownNodeTypes.includes(nodeType)) return breakdownNodeTypes;
  else if (researchNodeTypes.includes(nodeType)) return researchNodeTypes;
  else if (justificationNodeTypes.includes(nodeType)) return justificationNodeTypes;
  else return [];
};

export const areSameCategoryNodes = (node1Type: NodeType, node2Type: NodeType): boolean => {
  return getSameCategoryNodeTypes(node1Type).includes(node2Type);
};
