import { z } from "zod";

import { nodeSchema } from "@/common/node";

export const tableFilterSchema = z.object({
  centralProblemId: nodeSchema.shape.id.optional(), // there could be no problems to choose from
  solutions: z.array(nodeSchema.shape.id),
  criteria: z.array(nodeSchema.shape.id),
});

export type TableFilter = z.infer<typeof tableFilterSchema>;
