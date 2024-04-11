import { z } from "zod";

import { InfoCategory } from "./infoCategory";

// not sure how to guarantee that this matches the schema enum
export const relationNames = [
  // topic
  "causes",
  "subproblemOf",
  "addresses",
  "accomplishes",
  "createdBy",
  "has",
  "criterionFor",
  "creates",
  "embodies",
  "obstacleOf",

  // research
  "asksAbout", //question to any node
  "potentialAnswerTo", //answer to question
  "relevantFor", //fact, source to any node except fact, source
  "sourceOf", //source to fact
  "mentions", //source to source

  // claim
  "supports",
  "critiques",

  // generic, for unrestricted editing
  "relatesTo",
] as const;

const zRelationNames = z.enum(relationNames);

export type RelationName = z.infer<typeof zRelationNames>;

export const edgeSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number(),
  arguedDiagramPartId: z.string().uuid().nullable(),
  type: zRelationNames,
  customLabel: z
    .string()
    .max(30)
    .regex(/^[a-z ]+$/i)
    .nullable(),
  notes: z.string().max(10000),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
});

export type Edge = z.infer<typeof edgeSchema>;

export const infoRelationNames: Record<InfoCategory, RelationName[]> = {
  structure: [
    "causes",
    "subproblemOf",
    "addresses",
    "accomplishes",
    "createdBy",
    "has",
    "criterionFor",
    "creates",
    "embodies",
    "obstacleOf",
    "relatesTo", // is a generic relation but currently only seems worthwhile in topic
  ],
  research: ["asksAbout", "potentialAnswerTo", "relevantFor", "sourceOf", "mentions"],
  justification: ["supports", "critiques"],
};

export const structureRelationNames = infoRelationNames.structure;
export const researchRelationNames = infoRelationNames.research;
export const justificationRelationNames = infoRelationNames.justification;

export const getSiblingEdgeTypes = (edgeType: RelationName): RelationName[] => {
  if (structureRelationNames.includes(edgeType)) return structureRelationNames;
  else if (researchRelationNames.includes(edgeType)) return researchRelationNames;
  else if (justificationRelationNames.includes(edgeType)) return justificationRelationNames;
  else return [];
};
