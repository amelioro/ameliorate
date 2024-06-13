import { commentRouter } from "@/api/routers/comment";
import { notificationRouter } from "@/api/routers/notifications";
import { subscriptionRouter } from "@/api/routers/subscription";
import { topicRouter } from "@/api/routers/topic";
import { userRouter } from "@/api/routers/user";
import { viewRouter } from "@/api/routers/view";
import { watchRouter } from "@/api/routers/watch";
import { router } from "@/api/trpc";

export const appRouter = router({
  topic: topicRouter,
  user: userRouter,
  view: viewRouter,
  comment: commentRouter,
  notification: notificationRouter,
  subscriptions: subscriptionRouter, // plural to avoid conflict with existing trpc.subscription method
  watch: watchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
