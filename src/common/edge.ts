import { z } from "zod";

// not sure how to guarantee that this matches the schema enum
export const relationNames = [
  "causes",
  "addresses",
  "createdBy",
  "has",
  "criterionFor",
  "creates",
  "embodies",
  "supports",
  "critiques",
] as const;

const zRelationNames = z.enum(relationNames);

export type RelationName = z.infer<typeof zRelationNames>;

export const edgeSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number(),
  arguedDiagramPartId: z.string().uuid().nullable(),
  type: zRelationNames,
  notes: z.string().max(10000),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
});

export type Edge = z.infer<typeof edgeSchema>;

export const topicRelationNames: RelationName[] = [
  "causes",
  "addresses",
  "createdBy",
  "has",
  "criterionFor",
  "creates",
  "embodies",
];
export const claimRelationNames: RelationName[] = ["supports", "critiques"];
