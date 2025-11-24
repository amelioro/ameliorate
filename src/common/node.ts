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
  // breakdown
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

export const zNodeTypes = z.enum(nodeTypes).describe(
  `Implies the intended meaning of the node. There are three categories of node types: Breakdown, Research, and Justification.  Generally if a node could be a breakdown node or another category of node, it should be a breakdown node, because those are generally causally-related nodes, and causally-related things are easier to reason about.

Breakdown nodes are the primary focus of a diagram, and usually causally-relate to each other.

Breakdown node types:
- Problem: core problem that wants to be solved, e.g. "cars going too fast in my neighborhood"
- Cause: matters mainly because it causes a Problem, e.g. "street goes downhill"
- Detriment: if caused by a Problem, explains why a Problem is concerning; if caused by a Solution, explains a downside of a Solution; e.g. "pedestrians might get hit"
- Benefit: positive effect, e.g. "people get places faster"
- Effect: neutral effect; use this if an effect isn't obviously positive or negative, e.g. "fewer larger wildlife in neighborhood"
- Solution: option for addressing a Problem, or one of its Causes/Detriments, e.g. "speed bump between intersection and hill"
- Solution Component: piece of a Solution, e.g. "rubber, portable speed bump", "$500 cost"
- Obstacle: impedes a Solution, e.g. "street is a thoroughfare"
- Mitigation: option for addressing a downside of a Solution, e.g. "only place speedbump on downhill-going half of street"
- Mitigation Component: piece of a Mitigation, if the Mitigation is worth detailing
- Criterion: indicates a good aspect of a Solution and can be used to compare Solutions, e.g. "inexpensive"; this isn't causally-related to other breakdown nodes, and so doesn't necessarily belong in this category, but it's here for now.

Research nodes are auxiliary nodes that provide context about unknowns to look into, relevant facts, etc. These generally relate to a specific node or nodes.

Research node types:
- Question: an unknown that would be good to clarify or find an answer for, usually asks about another node, e.g. "what traffic data is available?"
- Answer: potential answer to a question
- Fact: auxiliary detail, usually a statistic, e.g. "residential street has 25 mph speed limit"
- Source: source of some information, could be an article or website; these node's text should generally be a title, and the node's notes should be the URL; e.g. "WI traffic manual"

Justification nodes are auxiliary nodes that convey arguments in support or critique of the implication of a node or edge in the topic. Node implications are "[node text] is an important [node type] in the context of this topic", and edge implications are "[source node text] [edge type, verb] [target node text]".

Justification node types:
- Root Claim: a claim about the impliciation of a node or edge, e.g. "'cars going too fast in my neighborhood' is an important Problem in the context of this topic"
- Support: a claim that supports another claim, e.g. "visually see cars zipping by all the time"
- Critique: a claim that critiques another claim, e.g. "we measured traffic years ago, and it wasn't a problem".

Finally, there's the Custom node, which can be used when there's some information that doesn't fit cleanly into another existing node type.`,
);

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

export const prettyNodeTypes: Record<NodeType, string> = {
  cause: "Cause",
  problem: "Problem",
  criterion: "Criterion",
  solutionComponent: "Component",
  benefit: "Benefit",
  effect: "Effect",
  detriment: "Detriment",
  solution: "Solution",
  obstacle: "Obstacle",
  mitigationComponent: "Component",
  mitigation: "Mitigation",
  question: "Question",
  answer: "Answer",
  fact: "Fact",
  source: "Source",
  rootClaim: "Root Claim",
  support: "Support",
  critique: "Critique",
  custom: "Custom",
};

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
