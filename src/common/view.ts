import { z } from "zod";

import { topicSchema } from "@/common/topic";

export const savedViewTypes = ["shared", "quick"] as const;
export const zSavedViewTypes = z.enum(savedViewTypes);
export type SavedViewType = z.infer<typeof zSavedViewTypes>;

export const savedViewSchema = z.object({
  id: z.string(),
  topicId: topicSchema.shape.id,
  type: zSavedViewTypes,
  title: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^(?![ -])(?!.*[ -]$)[a-zA-Z0-9 -]+$/,
      "Title may only contain alphanumeric characters, spaces, and dashes, and cannot begin or end with a space or dash.",
    )
    .optional(),
  order: z.number().safe().optional(),
  viewState: z.object({}).passthrough(), // TODO: extract view options from web/ so we can have type safety here
});

export type SavedView = z.infer<typeof savedViewSchema>;

export const quickViewSchema = savedViewSchema
  .extend({
    type: z.literal("quick"),
  })
  .required();

export type QuickView = z.infer<typeof quickViewSchema>;
