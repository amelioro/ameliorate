import { xprisma } from "@/db/extendedPrisma";

export const handleGraphPartChanged = async (editorUsername: string, topicId: number) => {
  const userWatch = await xprisma.watch.findFirst({
    where: { watcherUsername: editorUsername, topicId: topicId },
  });
  if (!userWatch) {
    await xprisma.watch.create({
      data: {
        watcherUsername: editorUsername,
        topicId: topicId,
        type: "all",
      },
    });
  }
};
