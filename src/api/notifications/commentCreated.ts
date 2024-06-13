import { Topic, User } from "@prisma/client";
import truncate from "lodash/truncate";

import { Comment } from "@/common/comment";
import { errorWithData } from "@/common/errorHandling";
import { InAppNotification, maxMessageLength } from "@/common/inAppNotification";
import { getBaseUrl } from "@/common/utils";
import { xprisma } from "@/db/extendedPrisma";

type UserToNotify = User & { reasonSource: { id: number; type: "watch" | "subscription" } };

/**
 * user should receive an in-app notification if:
 * - they aren't the comment's author AND
 * - they aren't ignoring the topic AND
 * - either
 *   - they are subscribed to the thread starter comment OR
 *   - they are watching the topic
 */
const getUsersToNotify = async (comment: Comment, threadStarterCommentId: string) => {
  const subscribers = await xprisma.user.findMany({
    where: {
      NOT: { username: comment.authorName },
      watches: {
        none: {
          topicId: comment.topicId,
          type: "ignore",
        },
      },
      subscriptions: {
        some: {
          sourceId: threadStarterCommentId,
          sourceType: "threadStarterComment",
        },
      },
    },
    include: { subscriptions: true },
  });
  const subscribersToNotify = subscribers.map((subscriber) => {
    const subscription = subscriber.subscriptions.find(
      (subscription) => subscription.sourceId === threadStarterCommentId
    );
    if (!subscription) throw errorWithData("couldn't find subscription", { subscriber, comment });
    const user: UserToNotify = {
      ...subscriber,
      reasonSource: { id: subscription.id, type: "subscription" },
    };
    return user;
  });

  const subscriberIds = subscribers.map((subscriber) => subscriber.id);

  const watchers = await xprisma.user.findMany({
    where: {
      NOT: { OR: [{ username: comment.authorName }, { id: { in: subscriberIds } }] },
      watches: {
        some: {
          topicId: comment.topicId,
          type: "all",
        },
      },
    },
    include: { watches: true },
  });
  const watchersToNotify = watchers.map((watcher) => {
    const watch = watcher.watches.find((watch) => watch.topicId === comment.topicId);
    if (!watch) throw errorWithData("couldn't find watch", { watcher, comment });

    const user: UserToNotify = { ...watcher, reasonSource: { id: watch.id, type: "watch" } };
    return user;
  });

  return [...subscribersToNotify, ...watchersToNotify];
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
  usersToNotify: UserToNotify[]
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
      reason: userToNotify.reasonSource.type === "subscription" ? "subscribed" : "watching",
    };
    return notification;
  });

  await xprisma.inAppNotification.createMany({ data: inAppNotifications });
};

const subscribeAuthor = async (comment: Comment, threadStarterCommentId: string) => {
  const author = await xprisma.user.findUniqueOrThrow({
    where: { username: comment.authorName },
    include: { watches: true, subscriptions: true },
  });

  const authorIsIgnoringTopic = author.watches.some(
    (watch) => watch.topicId === comment.topicId && watch.type === "ignore"
  );

  const authorAlreadyHasSubscription = author.subscriptions.some(
    (subscription) => subscription.sourceId === threadStarterCommentId
  );

  if (authorIsIgnoringTopic || authorAlreadyHasSubscription) return;

  await xprisma.subscription.create({
    data: {
      subscriberUsername: author.username,
      sourceId: threadStarterCommentId,
      sourceType: "threadStarterComment",
    },
  });
};

export const handleCommentCreated = async (comment: Comment) => {
  const threadStarterCommentId = comment.parentType === "comment" ? comment.parentId : comment.id;
  if (!threadStarterCommentId) throw errorWithData("couldn't find thread starter comment", comment);

  await subscribeAuthor(comment, threadStarterCommentId);

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
