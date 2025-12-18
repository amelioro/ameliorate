import { commentRouter } from "@/api/routers/comment";
import { notificationRouter } from "@/api/routers/notifications";
import { subscriptionRouter } from "@/api/routers/subscription";
import { topicRouter } from "@/api/routers/topic";
import { topicAIRouter } from "@/api/routers/topicAI";
import { userRouter } from "@/api/routers/user";
import { viewRouter } from "@/api/routers/view";
import { watchRouter } from "@/api/routers/watch";
import { createCallerFactory, router } from "@/api/trpc";

export const appRouter = router({
  topic: topicRouter,
  user: userRouter,
  view: viewRouter,
  comment: commentRouter,
  notification: notificationRouter,
  subscriptions: subscriptionRouter, // plural to avoid conflict with existing trpc.subscription method
  watch: watchRouter,
  topicAI: topicAIRouter,
});

// for tests only? awkward but trpc's official example does this, and deprecated `appRouter.createContext` which was usable directly from tests https://github.com/trpc/examples-next-prisma-starter/blob/main/src/server/routers/_app.ts
export const createCaller = createCallerFactory(appRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
