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
