import { xprisma } from "@/db/extendedPrisma";

export const getPublicTopics = async () => {
  return await xprisma.topic.findMany({
    where: {
      visibility: "public",
    },
  });
};
