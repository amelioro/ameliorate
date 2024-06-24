import { xprisma } from "@/db/extendedPrisma";

export const unsubscribe = async (code: string) => {
  const unsubscribeCode = await xprisma.unsubscribeCode.findUnique({
    where: { code },
  });

  if (!unsubscribeCode) return false;

  const { subscriptionSourceId, subscriptionSourceType } = unsubscribeCode;
  const unsubscribeFromAll = subscriptionSourceId === null || subscriptionSourceType === null;

  if (unsubscribeFromAll) {
    await xprisma.user.update({
      where: { username: unsubscribeCode.subscriberUsername },
      data: { receiveEmailNotifications: false },
    });
  } else {
    try {
      // delete if subscription exists, don't care otherwise - prisma doesn't yet support deleteIfExists, see https://github.com/prisma/prisma/issues/4072#issuecomment-1058751883
      await xprisma.subscription.delete({
        where: {
          subscriberUsername_sourceId_sourceType: {
            subscriberUsername: unsubscribeCode.subscriberUsername,
            sourceId: subscriptionSourceId,
            sourceType: subscriptionSourceType,
          },
        },
      });
      // eslint-disable-next-line no-empty
    } catch {}
  }

  return true;
};
