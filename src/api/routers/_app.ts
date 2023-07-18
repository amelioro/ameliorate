import { router } from "../trpc";
import { topicRouter } from "./topic";
import { userRouter } from "./user";

export const appRouter = router({
  topic: topicRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
