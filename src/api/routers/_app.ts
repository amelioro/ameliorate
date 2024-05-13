import { router } from "../trpc";
import { topicRouter } from "./topic";
import { userRouter } from "./user";
import { viewRouter } from "./view";

export const appRouter = router({
  topic: topicRouter,
  user: userRouter,
  view: viewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
