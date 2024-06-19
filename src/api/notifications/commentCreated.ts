import { Topic, User } from "@prisma/client";
import truncate from "lodash/truncate";

import { Comment, isThreadStarterComment } from "@/common/comment";
import { errorWithData } from "@/common/errorHandling";
import { InAppNotification, maxMessageLength } from "@/common/inAppNotification";
import { getBaseUrl } from "@/common/utils";
import { xprisma } from "@/db/extendedPrisma";

/**
 * user should receive an in-app notification if:
 * - they aren't the comment's author AND
 * - they are subscribed to the thread starter comment
 */
const getUsersToNotify = async (comment: Comment, threadStarterCommentId: string) => {
  return await xprisma.user.findMany({
    where: {
      NOT: { username: comment.authorName },
      subscriptions: {
        some: {
          sourceId: threadStarterCommentId,
          sourceType: "threadStarterComment",
        },
      },
    },
  });
};

/**
 * e.g. 'reasonableUsername commented: "hey man I don't think so"',
 * or 'reasonableUsername replied: "hey man I don't think so"'
 */
export const getInAppNotificationMessage = (comment: Comment) => {
  const messagePrefix = `${comment.authorName} ${
    comment.parentType === "comment" ? "replied" : "commented"
  }: `;

  const quotesLength = 2;
  // Comments can be longer than notifications, so ensure the content fits.
  // Users can view the comment to see the whole thing.
  const truncatedContent = truncate(comment.content, {
    length: maxMessageLength - messagePrefix.length - quotesLength,
  });

  return `${messagePrefix}"${truncatedContent}"`;
};

const createInAppNotifications = async (
  comment: Comment,
  commentTopic: Topic,
  usersToNotify: User[],
) => {
  const sourceUrl = new URL(`/${commentTopic.creatorName}/${commentTopic.title}/`, getBaseUrl());
  sourceUrl.searchParams.set("comment", comment.id);

  const message = getInAppNotificationMessage(comment);

  const inAppNotifications = usersToNotify.map((userToNotify) => {
    const notification: Omit<InAppNotification, "id" | "createdAt"> = {
      notifiedUsername: userToNotify.username,
      topicId: comment.topicId,
      type: "commentCreated",
      data: {
        commentId: comment.id,
      },
      message,
      sourceUrl: sourceUrl.href,
    };
    return notification;
  });

  await xprisma.inAppNotification.createMany({ data: inAppNotifications });
};

/**
 * users should become subscribed if:
 * - if comment is thread-starter:
 *   - either
 *     - user is author and is not ignoring the topic
 *     - user has a watch `all` for the topic
 * - if comment is reply:
 *   - user doesn't already have a subscription AND
 *   - they authored the comment and have no `ignore` watch for the topic (ideally would just check `participatingOrMentions`, but that's assumed default if they don't have any watch)
 */
const createSubscriptions = async (comment: Comment, threadStarterCommentId: string) => {
  const usersToSubscribe = isThreadStarterComment(comment.parentType)
    ? await xprisma.user.findMany({
        where: {
          OR: [
            {
              username: comment.authorName,
              watches: {
                none: {
                  topicId: comment.topicId,
                  type: "ignore",
                },
              },
            },
            {
              watches: {
                some: {
                  topicId: comment.topicId,
                  type: "all",
                },
              },
            },
          ],
        },
      })
    : await xprisma.user.findMany({
        where: {
          subscriptions: {
            none: {
              sourceId: threadStarterCommentId,
              sourceType: "threadStarterComment",
            },
          },
          username: comment.authorName,
          watches: {
            none: {
              topicId: comment.topicId,
              type: "ignore",
            },
          },
        },
      });

  const subscriptionsToCreate = usersToSubscribe.map((user) => ({
    subscriberUsername: user.username,
    sourceId: threadStarterCommentId,
    sourceType: "threadStarterComment" as const,
  }));

  await xprisma.subscription.createMany({ data: subscriptionsToCreate });
};

export const handleCommentCreated = async (comment: Comment) => {
  const threadStarterCommentId = comment.parentType === "comment" ? comment.parentId : comment.id;
  if (!threadStarterCommentId) throw errorWithData("couldn't find thread starter comment", comment);

  await createSubscriptions(comment, threadStarterCommentId);

  const commentTopic = await xprisma.topic.findUniqueOrThrow({ where: { id: comment.topicId } });
  const usersToNotify = await getUsersToNotify(comment, threadStarterCommentId);

  await createInAppNotifications(comment, commentTopic, usersToNotify);

  // email subject:
  // - Re: reasonableUsername/reasonable-length-topic-title
  // if (env.sendgrid_key) {
  // const emailNotificationDatas = notificationDatas.filter((data) => data.notifiedUser.receiveNotificationEmails);
  // const emails = buildEmails(emailNotificationDatas);
  // await sendEmails(emails);
  // }
};
