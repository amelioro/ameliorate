import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

import { topicSchema } from "../../common/topic";
import { userSchema } from "../../common/user";
import { isLoggedIn } from "../auth";
import { prisma } from "../prisma";
import { procedure, router } from "../trpc";

export const topicRouter = router({
  findByUsernameAndTitle: procedure
    .input(
      z.object({
        username: userSchema.shape.username,
        title: topicSchema.shape.title,
      })
    )
    .query(async (opts) => {
      return await prisma.topic.findFirst({
        where: {
          title: opts.input.title,
          user: {
            username: opts.input.username,
          },
        },
      });
    }),

  create: procedure
    .use(isLoggedIn)
    .input(topicSchema.pick({ title: true }))
    .mutation(async (opts) => {
      return await prisma.topic.create({
        data: {
          title: opts.input.title,
          userId: opts.ctx.user.id,
        },
      });
    }),

  update: procedure
    .use(isLoggedIn)
    .input(topicSchema.pick({ id: true, title: true }))
    .mutation(async (opts) => {
      const topic = await prisma.topic.findUniqueOrThrow({ where: { id: opts.input.id } });
      if (opts.ctx.user.id !== topic.userId) throw new TRPCError({ code: "FORBIDDEN" });

      return await prisma.topic.update({
        where: { id: opts.input.id },
        data: {
          title: opts.input.title,
        },
      });
    }),

  delete: procedure
    .use(isLoggedIn)
    .input(topicSchema.pick({ id: true }))
    .mutation(async (opts) => {
      const topic = await prisma.topic.findUniqueOrThrow({ where: { id: opts.input.id } });
      if (opts.ctx.user.id !== topic.userId) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.topic.delete({ where: { id: opts.input.id } });

      return null;
    }),
});
