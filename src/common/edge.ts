import { z } from "zod";

import { type InfoCategory } from "@/common/infoCategory";
import { type NodeType } from "@/common/node";
import { type EdgeType } from "@/db/generated/prisma/enums";

export const relationNames = [
  // topic
  "causes",
  "addresses",
  "accomplishes",
  "contingencyFor",
  "has",
  "criterionFor",
  "fulfills",
  "impedes",
  "mitigates",

  // research
  "asksAbout", //question to any node
  "potentialAnswerTo", //answer to question
  "relevantFor", //fact, source to any node except fact, source
  "sourceOf", //source to fact
  "mentions", //source to source

  // justification
  "supports",
  "critiques",

  // generic, for unrestricted editing
  "relatesTo",
] as const satisfies readonly EdgeType[]; // `satisfies` to make it easier to ensure these types match the prisma schema's, while not requiring this file to depend on prisma (at least once types are stripped)

const zRelationNames = z.enum(relationNames);

export type RelationName = z.infer<typeof zRelationNames>;

export interface Relation {
  source: NodeType;
  name: RelationName;
  target: NodeType;
}

export const edgeSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number(),
  arguedDiagramPartId: z.string().uuid().nullable(),
  type: zRelationNames.describe(
    "This reads from the source node to the target node. E.g. source `Solution` node `addresses` target `Problem` node.",
  ),
  customLabel: z
    .string()
    .max(30)
    .regex(/^[a-z ]+$/i, "customLabel should only contain letters and spaces.")
    .nullable(),
  notes: z.string().max(10000),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
});

export type Edge = z.infer<typeof edgeSchema>;

/**
 * Intended for cases where we only need basic edge info, e.g. for graph algorithm stuff, not for
 * react components or store hooks/actions.
 *
 * Initial motivation: want a shared base type between direct and indirect edges so e.g. indirect
 * edges can still take advantage of functions that make sense for them.
 *
 * Considered also removing `type` and separating a `MinimalTypedEdge`, for pure graph algorithm
 * stuff that doesn't use Ameliorate types, but I don't think we have enough of that to justify the
 * separate type. If we add more "pure" stuff, we can reconsider at that time.
 */
export type MinimalEdge = Pick<Edge, "id" | "type" | "sourceId" | "targetId">;

export const topicAIEdgeSchema = edgeSchema
  .pick({
    type: true,
    notes: true,
  })
  .extend({
    tempSourceId: z.number(),
    tempTargetId: z.number(),
  });

/**
 * Looser schema to make hitting the API easier for consumers. Mainly different from `edgeSchema` in
 * that many fields are optional and can use `tempId`s to identify temp nodes.
 */
export const createEdgeSchema = edgeSchema
  .extend(topicAIEdgeSchema.shape)
  .partial({
    id: true,
    topicId: true,
    arguedDiagramPartId: true,
    customLabel: true,
    sourceId: true,
    targetId: true,
    tempSourceId: true,
    tempTargetId: true,
  })
  .refine((data) => {
    return data.sourceId !== undefined || data.tempSourceId !== undefined;
  }, "Must provide either sourceId or tempSourceId.")
  .refine((data) => {
    return data.targetId !== undefined || data.tempTargetId !== undefined;
  }, "Must provide either targetId or tempTargetId.")
  .describe(
    "Can use `tempSourceId`/`tempTargetId` to reference nodes that haven't been persisted yet, which you'll be identifying via `node.tempId`.",
  );

export type CreateEdge = z.infer<typeof createEdgeSchema>;

/**
 * Ideally we wouldn't need this outside of the frontend, or that it'd be identical to the backend
 * schema, but the frontend doesn't need `topicId` so it seems like it'll at least be different in
 * that way. Unfortunately we need this in `common/` here because it's used for the download
 * topic JSON logic, and we use downloaded files for `examples/` on the backend (e.g. for topic AI
 * examples).
 *
 * TODO?: I think ideally we'd have this be identical to backend schema except for `topicId`, and
 * name it something that implies `topicId` isn't needed ("localEdgeSchema"?).
 */
export const diagramStoreEdgeSchema = z.object({
  id: z.string(),
  data: z.object({
    /**
     * Distinguished from `type` because this is explicitly open user input, and `type` can maintain stricter typing
     */
    customLabel: z.string().nullable(),
    notes: z.string(),
    arguedDiagramPartId: z.string().optional(),
  }),
  type: zRelationNames,
  /**
   * id of the source graph part. Can be a node or an edge, but most UI edge operations only work
   * with node sources.
   *
   * It seems like there might be value in having a SuperEdge type that can point to edges, so that
   * regular edges can be distinguished. But that sounds like a lot of work and it's hard to tell
   * that it'd be worth it.
   */
  sourceId: z.string(), // arrows point from source to target
  /**
   * id of the target graph part. Can be a node or an edge, but most UI edge operations only work
   * with node targets.
   *
   * It seems like there might be value in having a SuperEdge type that can point to edges, so that
   * regular edges can be distinguished. But that sounds like a lot of work and it's hard to tell
   * that it'd be worth it.
   */
  targetId: z.string(), // arrows point from source to target
});

export const infoRelationNames: Record<InfoCategory, RelationName[]> = {
  breakdown: [
    "causes",
    "addresses",
    "accomplishes",
    "contingencyFor",
    "has",
    "criterionFor",
    "fulfills",
    "impedes",
    "mitigates",
    "relatesTo", // is a generic relation but currently only seems worthwhile in topic
  ],
  research: ["asksAbout", "potentialAnswerTo", "relevantFor", "sourceOf", "mentions"],
  justification: ["supports", "critiques"],
};

export const breakdownRelationNames = infoRelationNames.breakdown;
export const researchRelationNames = infoRelationNames.research;
export const justificationRelationNames = infoRelationNames.justification;

export const getEdgeInfoCategory = (edgeType: RelationName): InfoCategory => {
  if (breakdownRelationNames.includes(edgeType)) return "breakdown";
  else if (researchRelationNames.includes(edgeType)) return "research";
  else if (justificationRelationNames.includes(edgeType)) return "justification";
  else throw new Error(`Unknown edge type: ${edgeType}`);
};

export const getSameCategoryEdgeTypes = (edgeType: RelationName): RelationName[] => {
  const infoCategory = getEdgeInfoCategory(edgeType);
  return infoRelationNames[infoCategory];
};
