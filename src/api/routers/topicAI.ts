import { zodToJsonSchema } from "zod-to-json-schema";

import {
  getRefinedVisibleAct,
  topicAICreatePartsSchema,
  visibleActSourceText,
} from "@/api/topicAI";
import { procedure, router } from "@/api/trpc";

export const topicAIRouter = router({
  getPromptData: procedure.query(() => {
    return {
      schemas: {
        createParts: zodToJsonSchema(topicAICreatePartsSchema),
      },
      examples: {
        visibleAct: {
          sourceText: visibleActSourceText,
          topic: getRefinedVisibleAct(),
        },
      },
    };
  }),
});
