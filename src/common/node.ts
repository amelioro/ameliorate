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
  text: z
    .string()
    .max(200)
    .describe(
      "Brief summary of the node's meaning. Should generally be concise and in clauses rather than complete sentences.",
    ),
  notes: z.string().max(10000),
});

export type Node = z.infer<typeof nodeSchema>;

export const topicAINodeSchema = nodeSchema
  .pick({
    type: true,
    text: true,
    notes: true,
  })
  .extend({
    tempId: z.number(),
  });

/**
 * Looser schema to make hitting the API easier for consumers. Mainly different from `nodeSchema` in that many fields are optional and can use `tempId`.
 */
export const createNodeSchema = nodeSchema
  .extend(topicAINodeSchema.shape)
  .partial({ id: true, tempId: true, topicId: true, arguedDiagramPartId: true, customType: true })
  .describe(
    "Can use `tempId` to identify the node if you can't reliably generate a UUIDv4 for `id`.",
  );

export type CreateNode = z.infer<typeof createNodeSchema>;

/**
 * Ideally we wouldn't need this outside of the react-flow components, but we unfortunately let this
 * format leak into everywhere on the frontend, including the download topic JSON logic, and we use
 * downloaded files for `examples/`, which we use on the backend (e.g. for topic AI examples).
 *
 * TODO: use the above `nodeSchema` in most places on the frontend, and only use the flow schema for
 * flow-related components.
 */
export const reactFlowNodeSchema = z.object({
  id: z.string(),
  data: z.object({
    /**
     * Distinguished from `type` because this is explicitly open user input, and `type` can maintain stricter typing
     */
    customType: z.string().nullable(),
    label: z.string(),
    notes: z.string(),
    arguedDiagramPartId: z.string().optional(),
  }),
  type: zNodeTypes,
});

export const goodNodeTypes: NodeType[] = [
  "solutionComponent",
  "benefit",
  "solution",
  "mitigationComponent",
  "mitigation",
];

export const badNodeTypes: NodeType[] = ["cause", "problem", "detriment", "obstacle"];

export const effectNodeTypes: NodeType[] = ["benefit", "effect", "detriment"];

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

export const getNodeInfoCategory = (nodeType: NodeType): InfoCategory => {
  if (breakdownNodeTypes.includes(nodeType)) return "breakdown";
  else if (researchNodeTypes.includes(nodeType)) return "research";
  else if (justificationNodeTypes.includes(nodeType)) return "justification";
  else throw new Error(`Unknown node type: ${nodeType}`);
};

export const getSameCategoryNodeTypes = (nodeType: NodeType): NodeType[] => {
  const infoCategory = getNodeInfoCategory(nodeType);
  return infoNodeTypes[infoCategory];
};

export const areSameCategoryNodes = (node1Type: NodeType, node2Type: NodeType): boolean => {
  return getSameCategoryNodeTypes(node1Type).includes(node2Type);
};

export const isDefaultCoreNodeType = (nodeType: NodeType): boolean => {
  return nodeType === "problem" || nodeType === "solution";
};

const nodePriorities = Object.fromEntries(
  nodeTypes.map((type, index) => [type, index.toString()]),
) as {
  [type in NodeType]: string;
};

export const compareNodesByType = (node1: { type: NodeType }, node2: { type: NodeType }) => {
  return Number(nodePriorities[node1.type]) - Number(nodePriorities[node2.type]);
};

export const isEffect = (nodeType: NodeType): boolean => {
  return effectNodeTypes.includes(nodeType);
};
