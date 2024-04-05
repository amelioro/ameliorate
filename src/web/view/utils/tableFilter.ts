import { z } from "zod";

import { nodeSchema } from "../../../common/node";

export const tableFilterSchema = z.object({
  centralProblemId: nodeSchema.shape.id,
  solutions: z.array(nodeSchema.shape.id),
  criteria: z.array(nodeSchema.shape.id),
});

export type TableFilter = z.infer<typeof tableFilterSchema>;
