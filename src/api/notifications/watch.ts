import { xprisma } from "@/db/extendedPrisma";

export const handleGraphPartChanged = async (username: string, id: number) => {
  const userWatch = await xprisma.watch.findFirst({
    where: { watcherUsername: username, topicId: id },
  });
  if (!userWatch) {
    await xprisma.watch.create({
      data: {
        watcherUsername: username,
        topicId: id,
        type: "all",
      },
    });
  }
};
