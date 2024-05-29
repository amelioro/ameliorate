import { router } from "../trpc";
import { commentRouter } from "./comment";
import { topicRouter } from "./topic";
import { userRouter } from "./user";
import { viewRouter } from "./view";

export const appRouter = router({
  topic: topicRouter,
  user: userRouter,
  view: viewRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
