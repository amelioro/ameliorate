import { truncate } from "es-toolkit/compat";
import { encode } from "he";

import { Email, canSendEmails, sendAllEmails } from "@/api/email";
import { Comment, getLinkToComment, isThreadStarterComment } from "@/common/comment";
import { errorWithData } from "@/common/errorHandling";
import { InAppNotification, maxMessageLength } from "@/common/inAppNotification";
import { getBaseUrl } from "@/common/utils";
import { xprisma } from "@/db/extendedPrisma";
import { Topic, UnsubscribeCode, User } from "@/db/generated/prisma/client";

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
      sourceUrl: getLinkToComment(comment.id, commentTopic),
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

type UserWithUnsubscribeCodes = User & {
  unsubscribeThreadCode: Omit<UnsubscribeCode, "createdAt">;
  unsubscribeAllCode: Omit<UnsubscribeCode, "createdAt">;
};

const createUnsubscribeCodesForUsers = async (users: User[], threadStarterCommentId: string) => {
  const unsubscribeThreadCodes: Omit<UnsubscribeCode, "createdAt">[] = users.map((user) => {
    const code: Omit<UnsubscribeCode, "createdAt"> = {
      code: crypto.randomUUID(), // guarantee that we're using a securely-random code, apparently not all v4 UUIDs are guaranteed to be securely random https://security.stackexchange.com/questions/157270/using-v4-uuid-for-authentication
      subscriberUsername: user.username,
      subscriptionSourceId: threadStarterCommentId,
      subscriptionSourceType: "threadStarterComment",
    };
    return code;
  });

  const unsubscribeAllCodes: Omit<UnsubscribeCode, "createdAt">[] = users.map((user) => {
    const code: Omit<UnsubscribeCode, "createdAt"> = {
      code: crypto.randomUUID(),
      subscriberUsername: user.username,
      subscriptionSourceId: null,
      subscriptionSourceType: null,
    };
    return code;
  });

  await xprisma.unsubscribeCode.createMany({
    data: unsubscribeThreadCodes.concat(unsubscribeAllCodes),
  });

  return users.map((user) => {
    const unsubscribeThreadCode = unsubscribeThreadCodes.find(
      (code) => code.subscriberUsername === user.username,
    );
    const unsubscribeAllCode = unsubscribeAllCodes.find(
      (code) => code.subscriberUsername === user.username,
    );
    if (!unsubscribeThreadCode || !unsubscribeAllCode)
      throw errorWithData("couldn't find unsubscribe code for user", { user });

    return { ...user, unsubscribeThreadCode, unsubscribeAllCode };
  });
};

const buildEmails = (
  comment: Comment,
  commentTopic: Topic,
  usersToEmail: UserWithUnsubscribeCodes[],
): Email[] => {
  const linkToComment = getLinkToComment(comment.id, commentTopic);

  return usersToEmail.map((user) => {
    const linkToUnsubscribeThread = `${getBaseUrl()}/unsubscribe/${user.unsubscribeThreadCode.code}`;
    const linkToUnsubscribeAll = `${getBaseUrl()}/unsubscribe/${user.unsubscribeAllCode.code}`;

    const email: Email = {
      fromName: comment.authorName,
      to: user.email,
      subject: `Re: ${commentTopic.creatorName}/${commentTopic.title}`,
      // white-space styling because otherwise white-space is collapsed
      // encode comment content because otherwise users could use HTML injection, but their comments should be rendered as-is
      html: `<div style="white-space: pre;">${encode(comment.content)}
—
<a href="${linkToComment}">View comment on Ameliorate</a>.

<a href="${linkToUnsubscribeThread}">Unsubscribe from thread</a> | <a href="${linkToUnsubscribeAll}">Unsubscribe from all Ameliorate notification emails</a>.
</div>`,
    };

    return email;
  });
};

export const handleCommentCreated = async (comment: Comment) => {
  const threadStarterCommentId = comment.parentType === "comment" ? comment.parentId : comment.id;
  if (!threadStarterCommentId) throw errorWithData("couldn't find thread starter comment", comment);

  await createSubscriptions(comment, threadStarterCommentId);

  const commentTopic = await xprisma.topic.findUniqueOrThrow({ where: { id: comment.topicId } });
  const usersToNotify = await getUsersToNotify(comment, threadStarterCommentId);

  await createInAppNotifications(comment, commentTopic, usersToNotify);

  if (canSendEmails()) {
    const usersToEmail = usersToNotify.filter((user) => user.receiveEmailNotifications);
    const usersToEmailWithUnsubscribeCodes = await createUnsubscribeCodesForUsers(
      usersToEmail,
      threadStarterCommentId,
    );
    const emails = buildEmails(comment, commentTopic, usersToEmailWithUnsubscribeCodes);
    await sendAllEmails(emails);
  }
};
