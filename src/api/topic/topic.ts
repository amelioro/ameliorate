import { xprisma } from "@/db/extendedPrisma";
import { type TopicGetPayload, type TopicInclude } from "@/db/generated/prisma/models";

export const getPublicTopics = async () => {
  return await xprisma.topic.findMany({
    where: {
      visibility: "public",
    },
  });
};

export const findTopicByUsernameAndTitle = async <TInclude extends TopicInclude | undefined>(
  isCreator: boolean,
  topicCreatorName: string,
  topicTitle: string,
  include?: TInclude,
) => {
  const topic = await xprisma.topic.findFirst({
    where: {
      title: topicTitle,
      creatorName: topicCreatorName,
      visibility: isCreator ? undefined : { not: "private" },
    },
    include,
  });

  // not sure how to more-cleanly (i.e. without "as") ensure the `include` type carries through `findFirst` when `include` can be undefined.
  // when `include` can't be undefined, it works fine.
  // apparently function overloads (creating a separate prototype for include being defined vs undefined) might work, but that seems annoying to write/read, and not worth
  return topic as TopicGetPayload<{ include: TInclude }> | null;
};
