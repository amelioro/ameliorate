import { z } from "zod";

export const savedViewTypes = ["shared", "quick"] as const;
export const zSavedViewTypes = z.enum(savedViewTypes);
export type SavedViewType = z.infer<typeof zSavedViewTypes>;

export const savedViewSchema = z.object({
  id: z.string(),
  type: zSavedViewTypes,
  title: z
    .string()
    .regex(
      /^(?! )(?!.* $)[a-zA-Z0-9 ]+$/,
      "Title may only contain alphanumeric characters or spaces, and cannot begin or end with a space."
    )
    .optional(),
  order: z.number().optional(),
  viewState: z.object({}).passthrough(), // TODO: extract view options from web/ so we can have type safety here
});

export type SavedView = z.infer<typeof savedViewSchema>;

export const quickViewSchema = savedViewSchema
  .extend({
    type: z.literal("quick"),
  })
  .required();

export type QuickView = z.infer<typeof quickViewSchema>;
