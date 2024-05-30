import { commentRouter } from "@/api/routers/comment";
import { topicRouter } from "@/api/routers/topic";
import { userRouter } from "@/api/routers/user";
import { viewRouter } from "@/api/routers/view";
import { router } from "@/api/trpc";

export const appRouter = router({
  topic: topicRouter,
  user: userRouter,
  view: viewRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
